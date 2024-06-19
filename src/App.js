import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import OrdenarPlaylists from './components/OrdenarPlaylists';
import PlaylistView from './components/PlaylistView/PlaylistView'; 
import resultsData from './results.json';
import './theme.css';
import { ThemeContext, ThemeProvider } from './context/ThemeContext'; 
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch';

function App() {
  // URL de autenticación de Spotify
  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=${process.env.REACT_APP_SCOPE}&show_dialog=true`;

  const [accessToken, setAccessToken] = useState(null);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const { theme, toggleTheme } = useContext(ThemeContext);
  

  // Imaginemos que esta función se llama cuando el usuario inicia sesión correctamente
  function handleLogin() {
    setIsLoggedIn(true);
  }

  // Función para invertir el orden de las playlists
  const invertPlaylists = () => {
    // Crea una copia del array de playlists y reviértelo
    const reversed = [...playlists].reverse();
    setPlaylists(reversed);
  };

  useEffect(() => {
    // Convierte el objeto importado 'resultsData' en un arreglo de objetos de playlists
    const playlistsArray = Object.keys(resultsData).map((key) => ({
      name: key,
      ...resultsData[key],
    }));

    setPlaylists(playlistsArray);


    // Autenticación con Spotify
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


  // Este useEffect maneja el cambio de tema
useEffect(() => {
  // Agrega la clase del tema actual al body
  document.body.classList.add(`${theme}-theme`);

  // Función de limpieza para eliminar la clase del tema anterior
  return () => {
    document.body.classList.remove(`${theme}-theme`);
  };
}, [theme]); // Dependencias solo relacionadas con el cambio de tema
return (
  <div className="App">
    <ThemeSwitch
  key={theme} 
  id="theme-switch"
  switchClass="custom-switch-class"
  sliderClass="custom-slider-class"
/>
<header className="App-header">
      <div className={`App ${theme}-theme`} />
      <h1>Welcome to Sortify</h1>
      <p>Sortify is an app that allows you to sort your Spotify playlists.</p>
      <a className="App-link" href={AUTH_URL} target="_blank" rel="noopener noreferrer">
        Spotify Login
      </a>
      <br />
      <a >
      <button onClick={invertPlaylists}>Reverse Playlists</button> {/* Aquí está el botón */}
      </a>
      {isLoggedIn && (
        <Link to="/ordenar-playlists">
          <button>Sort Playlists</button>
        </Link>
      )}
    </header>
    <Routes>
      <Route path="/" element={<PlaylistView playlists={playlists} />} />
      <Route path="/Sortify" element={<PlaylistView playlists={playlists} />} />
      <Route path="/ordenar-playlists" element={<OrdenarPlaylists />} />
    </Routes>
  </div>
);
}

export default () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);