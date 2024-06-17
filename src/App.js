import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import OrdenarPlaylists from './components/OrdenarPlaylists';
import PlaylistView from './components/PlaylistView'; // Asegúrate de que el componente esté en la ruta correcta
import resultsData from './results.json'; // Asegúrate de que la ruta al archivo es correcta

function App() {
  // URL de autenticación de Spotify
  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=${process.env.REACT_APP_SCOPE}&show_dialog=true`;

  const [accessToken, setAccessToken] = useState(null);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Imaginemos que esta función se llama cuando el usuario inicia sesión correctamente
  function handleLogin() {
    setIsLoggedIn(true);
  }

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (code) {
      axios.post('http://localhost:3000/api/token', {
        code,
        redirect_uri: process.env.REACT_APP_REDIRECT_URI,
        grant_type: 'authorization_code',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }).then(response => {
        setAccessToken(response.data.access_token);
        handleLogin(); // Llama a handleLogin después de obtener el token
      }).catch(error => {
        console.error('Error al obtener el token:', error);
      });
    }
  }, [location]);

  return (
    <div className="App">
      <header className="App-header">
              <h1>Bienvenido a Sortify</h1>
              <p>
                Sortify es una aplicación que te permite gestionar tus playlists de Spotify de manera eficiente.
              </p>
              <a
                className="App-link"
                href={AUTH_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Iniciar sesión con Spotify
              </a>
              {isLoggedIn && (
          <Link to="/ordenar-playlists">
            <button>Ordenar Playlists</button>
          </Link>
        )}
      </header>
      <Routes>
        <Route path="/ordenar-playlists" element={<OrdenarPlaylists />} />
        <Route path="/ver-playlists" element={<PlaylistView playlists={resultsData} />} />
      </Routes>
    </div>
  );
}

export default App;