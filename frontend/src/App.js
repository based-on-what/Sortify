import React, { useState, useEffect, useContext } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import OrdenarPlaylists from './components/OrdenarPlaylists';
import PlaylistView from './components/PlaylistView/PlaylistView';
import resultsData from './results.json';
import './theme.css';
import './animations.css';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getAuthUrl } from './utils/auth';

const spotifyApi = new SpotifyWebApi();

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

  const invertPlaylists = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const reversed = [...playlists].reverse();
      setPlaylists(reversed);
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    }, 100);
  };

  useEffect(() => {
    const playlistsArray = Object.keys(resultsData).map((key) => ({
      name: key,
      ...resultsData[key],
    }));
    setPlaylists(playlistsArray);

    const hash = new URLSearchParams(location.hash.replace('#', ''));
    const token = hash.get('access_token');
    if (token && !accessToken) {
      setAccessToken(token);
      spotifyApi.setAccessToken(token);
      setIsLoggedIn(true);
      navigate('/ordenar-playlists'); // Redirige a la página de ordenar playlists después de iniciar sesión
    }
  }, [location.hash, accessToken, navigate]);

  useEffect(() => {
    document.body.classList.add(`${theme}-theme`);
    return () => {
      document.body.classList.remove(`${theme}-theme`);
    };
  }, [theme]);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const bodyOffsetHeight = document.body.offsetHeight;

    // Mostrar botón de scroll hacia arriba cuando el scroll es mayor a 200px
    setShowScrollTopButton(scrollY > 200);

    // Mostrar botón de scroll hacia abajo cuando el scroll está cerca del final de la página
    setShowScrollBottomButton(scrollY + innerHeight >= bodyOffsetHeight - 200);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleLogin = () => {
    window.location.href = getAuthUrl(); // Redirige a la URL de autorización de Spotify
  };

  useEffect(() => {
    // Agregar un evento de scroll inicial para determinar si se deben mostrar los botones
    handleScroll();
  }, []); // Se ejecuta solo una vez al inicio

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
        <button className="btn btn-primary btn-lg" onClick={invertPlaylists}>Reverse Playlists</button>
        <button className="btn btn-primary btn-lg" onClick={handleLogin}>Spotify Login</button>
        {isLoggedIn && (
          <Link to="/ordenar-playlists">
            <button className="btn btn-secondary btn-lg">Sort Playlists</button>
          </Link>
        )}
        {showScrollTopButton && (
          <button className="btn btn-primary scroll-top-button" onClick={scrollToTop}>
            <i className="bi bi-arrow-up-short"></i>
          </button>
        )}
        {showScrollBottomButton && (
          <button className="btn btn-primary scroll-bottom-button" onClick={scrollToBottom}>
            <i className="bi bi-arrow-down-short"></i>
          </button>
        )}
      </header>
      <Routes>
        <Route path="/" element={<PlaylistView playlists={playlists} isAnimating={isAnimating} />} />
        <Route path="/Sortify" element={<PlaylistView playlists={playlists} isAnimating={isAnimating} />} />
        <Route path="/ordenar-playlists" element={<OrdenarPlaylists setPlaylists={setPlaylists} />} />
        <Route path="/Sortify/callback" element={<div>Loading...</div>} /> {/* Ruta para manejar el callback */}
      </Routes>
    </div>
  );
}

export default () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
