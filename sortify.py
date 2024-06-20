from flask import Flask, jsonify, request
from flask_cors import CORS
from spotipy.oauth2 import SpotifyOAuth
import spotipy
import os
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
import json
import time

app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, World!"


CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
load_dotenv()

# Inicializa la autenticación de Spotify una sola vez
auth_manager = SpotifyOAuth(client_id=os.getenv('REACT_APP_CLIENT_ID'),
                            client_secret=os.getenv('REACT_APP_CLIENT_SECRET'),
                            redirect_uri=os.getenv('REACT_APP_REDIRECT_URI'),
                            scope=os.getenv('REACT_APP_SCOPE'))
sp = spotipy.Spotify(auth_manager=auth_manager)

def convertir_milliseconds(milliseconds):
    seconds = milliseconds / 1000
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)
    return {
        "days": int(days),
        "hours": int(hours),
        "minutes": int(minutes),
        "seconds": int(seconds)
    }

def get_playlist_tracks(playlist):
    # Reutiliza la instancia de spotipy.Spotify existente
    tracks = []
    track_results = sp.playlist_items(playlist['id'], fields='items.track.duration_ms, next')
    tracks.extend(track_results['items'])
    while track_results['next']:
        track_results = sp.next(track_results)
        tracks.extend(track_results['items'])

    # Agrega la recuperación de la URL y la foto de la playlist
    playlist_url = playlist['external_urls']['spotify']
    playlist_image = playlist['images'][0]['url'] if playlist['images'] else None

    total_duration_ms = sum(track['track']['duration_ms'] for track in tracks if track['track'] is not None)
    total_duration_formatted = convertir_milliseconds(total_duration_ms)

    # Retorna un diccionario con la información relevante de la playlist
    return {
        'name': playlist['name'],
        'total_duration': total_duration_formatted,
        'url': playlist_url,
        'image': playlist_image
    }

@app.route('/api/invert-playlists', methods=['POST'])
def invert_playlists():
    data = request.json
    playlists = data['playlists']
    orden = int(data['orden'])

    # Obtener las duraciones de todas las playlists usando multithreading
    with ThreadPoolExecutor(max_workers=20) as executor:
        playlist_info = list(executor.map(get_playlist_tracks, playlists))

    # Ordenar las playlists según la opción seleccionada
    if orden == 0:
        sorted_playlists = sorted(playlist_info, key=lambda x: x['total_duration']['days']*86400000 +
                                x['total_duration']['hours']*3600000 +
                                x['total_duration']['minutes']*60000 +
                                x['total_duration']['seconds']*1000)
    else:
        sorted_playlists = sorted(playlist_info, key=lambda x: x['total_duration']['days']*86400000 +
                                x['total_duration']['hours']*3600000 +
                                x['total_duration']['minutes']*60000 +
                                x['total_duration']['seconds']*1000, reverse=True)

    # Retornar las playlists ordenadas al frontend
    return jsonify({'sorted_playlists': sorted_playlists})
# Después de guardar el archivo 'results.json', agregar esta ruta en Flask

@app.route('/api/playlists-sorted', methods=['GET'])
def get_sorted_playlists():
    ruta_completa = 'src/results.json'
    with open(ruta_completa, 'r', encoding='utf-8') as f:
        playlists_sorted = json.load(f)
    return jsonify(playlists_sorted)

if __name__ == '__main__':
    app.run(debug=True)
