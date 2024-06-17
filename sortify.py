from flask import Flask, jsonify
from flask_cors import CORS
from spotipy.oauth2 import SpotifyOAuth
import spotipy
import os
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
load_dotenv()

# Inicializa la autenticación de Spotify una sola vez
auth_manager = SpotifyOAuth(client_id=os.getenv('REACT_APP_CLIENT_ID'),
                            client_secret=os.getenv('REACT_APP_CLIENT_SECRET'),
                            redirect_uri=os.getenv('REACT_APP_REDIRECT_URI'),
                            scope=os.getenv('REACT_APP_SCOPE'))
sp = spotipy.Spotify(auth_manager=auth_manager)
def convertir_milisegundos(milisegundos):
    segundos = milisegundos / 1000
    minutos, segundos = divmod(segundos, 60)
    horas, minutos = divmod(minutos, 60)
    dias, horas = divmod(horas, 24)
    return {
        "days": int(dias),
        "hours": int(horas),
        "minutes": int(minutos),
        "seconds": int(segundos)
    }

def get_playlist_tracks(playlist):
    # Reutiliza la instancia de spotipy.Spotify existente
    #print(f'Obteniendo canciones de la playlist: {playlist["name"]}...')
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
    total_duration_formatted = convertir_milisegundos(total_duration_ms)

    # Modifica el return para incluir la URL y la foto
    final_return = playlist['name'], total_duration_formatted, playlist_url, playlist_image
    print(final_return)
    return final_return


@app.route('/playlists', methods=['GET'])
def get_playlists():
    # Agrega una entrada de usuario para determinar el orden de las playlists
    orden = input("Ingrese '0' para ordenar de la más corta a la más larga, o '1' para ordenar de la más larga a la más corta: ")
    orden = int(orden)  # Convierte la entrada a un entero

    username = 'wenam8'
    results = sp.user_playlists(username)
    playlists = results['items'] if results else []

    # Utiliza ThreadPoolExecutor para procesar las playlists en paralelo
    with ThreadPoolExecutor(max_workers=10) as executor:
        playlist_durations = list(executor.map(get_playlist_tracks, playlists))

    # Crea un diccionario con los nombres de las playlists como claves e incluye la URL y la foto
    playlist_durations_dict = {name: {'duration': duration, 'url': url, 'image': image} for name, duration, url, image in playlist_durations}

    # Ordena el diccionario por la duración total en milisegundos
    if orden == 0:
        playlist_durations_sorted = sorted(playlist_durations_dict.items(), key=lambda x: x[1]['duration']['dias']*86400000 + x[1]['duration']['horas']*3600000 + x[1]['duration']['minutos']*60000 + x[1]['duration']['segundos']*1000)
    else:
        playlist_durations_sorted = sorted(playlist_durations_dict.items(), key=lambda x: x[1]['duration']['dias']*86400000 + x[1]['duration']['horas']*3600000 + x[1]['duration']['minutos']*60000 + x[1]['duration']['segundos']*1000, reverse=True)
    playlist_durations_dict_sorted = {name: duration for name, duration in playlist_durations_sorted}

    ruta_completa = '/src/results.json'


    # Guarda el resultado en 'results.json'
    with open(ruta_completa, 'w', encoding='utf-8') as f:
        json.dump(playlist_durations_dict_sorted, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    app.run(debug=True)