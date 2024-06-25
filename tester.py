from flask import Flask, request, jsonify, session, redirect, url_for
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configuración de la aplicación Flask
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')  # Configura una clave secreta para las sesiones

# Configuración de autenticación de Spotipy
SPOTIPY_CLIENT_ID = os.getenv('REACT_APP_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('REACT_APP_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = os.getenv('REACT_APP_REDIRECT_URI')
SPOTIPY_SCOPE = os.getenv('REACT_APP_SCOPE')

# Configurar el objeto Spotipy
sp_oauth = SpotifyOAuth(SPOTIPY_CLIENT_ID, SPOTIPY_CLIENT_SECRET, SPOTIPY_REDIRECT_URI, scope=SPOTIPY_SCOPE)

# Ruta para iniciar sesión con Spotify
@app.route('/login')
def login():
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({'url': auth_url})

# Ruta de callback de Spotify
@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info  # Guarda el token de acceso en la sesión
    return redirect(url_for('me'))

# Ruta para obtener información del usuario
@app.route('/me')
def me():
    token_info = session.get('token_info', None)
    if token_info:
        access_token = token_info['access_token']
        sp = spotipy.Spotify(auth=access_token)
        user_info = sp.current_user()
        return jsonify(user_info)
    else:
        return jsonify({'error': 'Missing access token'})

if __name__ == '__main__':
    app.run(debug=True)
