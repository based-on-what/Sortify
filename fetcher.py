from flask import Flask, jsonify, request
from flask_cors import CORS
from spotipy.oauth2 import SpotifyOAuth
import spotipy
import os
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
import json
import logging
import requests
from requests.adapters import HTTPAdapter
from tenacity import retry, wait_exponential, stop_after_attempt
from spotipy.exceptions import SpotifyException
import time

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
load_dotenv()

# Configurar el registro
logging.basicConfig(level=logging.INFO)

# Configurar el adaptador con un pool de conexiones más grande
http = requests.Session()
adapter = HTTPAdapter(pool_connections=100, pool_maxsize=100)
http.mount("http://", adapter)
http.mount("https://", adapter)

# Inicializa la autenticación de Spotify una sola vez
auth_manager = SpotifyOAuth(client_id=os.getenv('REACT_APP_CLIENT_ID'),
                            client_secret=os.getenv('REACT_APP_CLIENT_SECRET'),
                            redirect_uri=os.getenv('REACT_APP_REDIRECT_URI'),
                            scope=os.getenv('REACT_APP_SCOPE'))
sp = spotipy.Spotify(auth_manager=auth_manager, requests_session=http)

def convertir_miliseconds(miliseconds):
    seconds = miliseconds / 1000
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)
    return {
        "days": int(days),
        "hours": int(hours),
        "minutes": int(minutes),
        "seconds": int(seconds)
    }

@retry(wait=wait_exponential(min=1, max=60), stop=stop_after_attempt(10))
def get_playlist_tracks(playlist):
    logging.info('Accediendo a la función get_playlist_tracks')
    tracks = []
    track_results = sp.playlist_items(playlist['id'], fields='items.track.duration_ms, next')
    tracks.extend(track_results['items'])
    while track_results['next']:
        track_results = sp.next(track_results)
        tracks.extend(track_results['items'])

    playlist_url = playlist['external_urls']['spotify']
    playlist_image = playlist['images'][0]['url'] if playlist['images'] else None

    total_duration_ms = sum(track['track']['duration_ms'] for track in tracks if track['track'] is not None)
    total_duration_formatted = convertir_miliseconds(total_duration_ms)

    final_return = {
        "name": playlist['name'],
        "total_duration": total_duration_formatted,
        "url": playlist_url,
        "image": playlist_image
    }
    return final_return

@app.route('/', methods=['GET'])
def home():
    return "HOLA MUNDO"

@app.route('/api/playlists', methods=['GET'])
def fetch_playlists():
    logging.info('Accediendo a la función fetch_playlists')
    orden = request.args.get('orden', type=int, default=0)  # Obtiene el parámetro 'orden' de la solicitud GET
    username = sp.me()['id']
    playlists = get_playlists_data(username)
    sorted_playlists = sort_playlists(playlists, orden)
    return jsonify(sorted_playlists)

def get_playlists_data(username):
    logging.info('Accediendo a la función get_playlists_data')
    ruta_emergencia = 'src/playlists.json'

    if os.path.isfile(ruta_emergencia):
        with open(ruta_emergencia, 'r', encoding='utf-8') as f:
            playlists = json.load(f)
    else:
        playlists = []
        offset = 0
        while True:
            results = sp.user_playlists(username, offset=offset)
            if results['items']:
                playlists.extend(results['items'])
                offset += len(results['items'])
            else:
                break
        with open(ruta_emergencia, 'w', encoding='utf-8') as f:
            json.dump(playlists, f, ensure_ascii=False, indent=4)
    
    return playlists

def sort_playlists(playlists, orden):
    logging.info('Accediendo a la función sort_playlists')
    with ThreadPoolExecutor(max_workers=5) as executor:  # Reduce el número de trabajadores
        playlist_durations = list(executor.map(get_playlist_tracks, playlists))

    if orden == 0:
        playlist_durations_sorted = sorted(playlist_durations, key=lambda x: x['total_duration']['days']*86400000 + x['total_duration']['hours']*3600000 + x['total_duration']['minutes']*60000 + x['total_duration']['seconds']*1000)
    else:
        playlist_durations_sorted = sorted(playlist_durations, key=lambda x: x['total_duration']['days']*86400000 + x['total_duration']['hours']*3600000 + x['total_duration']['minutes']*60000 + x['total_duration']['seconds']*1000, reverse=True)

    return playlist_durations_sorted

if __name__ == '__main__':
    app.run(debug=True)
