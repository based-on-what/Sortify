import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import OrdenarPlaylists from './components/OrdenarPlaylists';
import PlaylistView from './components/PlaylistView/PlaylistView'; 
import resultsData from './results.json';
import './theme.css';
import './animations.css'; // Importa tu archivo de animaciones
import { ThemeContext, ThemeProvider } from './context/ThemeContext'; 
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=${process.env.REACT_APP_SCOPE}&show_dialog=true`;

  const [accessToken, setAccessToken] = useState(null);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false); // Estado de animación
  const { theme, toggleTheme } = useContext(ThemeContext);

  function handleLogin() {
    setIsLoggedIn(true);
  }

  const invertPlaylists = () => {
    setIsAnimating(true); // Inicia la animación

    setTimeout(() => {
      const reversed = [...playlists].reverse();
      setPlaylists(reversed);
      // Mantener la animación un poco más para garantizar que el cambio de orden se vea fluido
      setTimeout(() => {
        setIsAnimating(false); // Termina la animación
      }, 100); // Espera un poco más de tiempo para que la animación termine
    }, 100); // Duración a la mitad de la animación
  };

  useEffect(() => {
    const playlistsArray = Object.keys(resultsData).map((key) => ({
      name: key,
      ...resultsData[key],
    }));

    setPlaylists(playlistsArray);

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
        handleLogin();
      }).catch(error => {
        console.error('Error al obtener el token:', error);
      });
    }
  }, [location]);

  useEffect(() => {
    document.body.classList.add(`${theme}-theme`);
    return () => {
      document.body.classList.remove(`${theme}-theme`);
    };
  }, [theme]);

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
        <button className="btn btn-primary btn-lg" onClick={invertPlaylists}>Reverse Playlists</button>
        {isLoggedIn && (
          <Link to="/ordenar-playlists">
            <button className="btn btn-secondary btn-lg">Sort Playlists</button>
          </Link>
        )}
      </header>
      <Routes>
        <Route path="/" element={<PlaylistView playlists={playlists} isAnimating={isAnimating} />} />
        <Route path="/Sortify" element={<PlaylistView playlists={playlists} isAnimating={isAnimating} />} />
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
