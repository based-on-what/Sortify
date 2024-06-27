const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Configura dotenv para cargar las variables de entorno desde un archivo .env
dotenv.config();

// Configura la autenticación de Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
});

const corsOptions = {
  origin: '*', 
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware para parsear JSON

// Función para convertir milisegundos a un formato de tiempo más legible
function convertMilliseconds(milliseconds) {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);

  return {
    days,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  };
}

// Función para obtener las canciones de una playlist
async function getPlaylistTracks(playlist) {
  try {
    const tracks = [];
    let offset = 0;
    let trackResults = await spotifyApi.getPlaylistTracks(playlist.id, { offset });

    tracks.push(...trackResults.body.items);

    while (trackResults.body.next) {
      offset += trackResults.body.limit;
      trackResults = await spotifyApi.getPlaylistTracks(playlist.id, { offset });
      tracks.push(...trackResults.body.items);
    }

    const playlistUrl = playlist.external_urls.spotify;
    const playlistImage = playlist.images.length > 0 ? playlist.images[0].url : null;

    const totalDurationMs = tracks.reduce((acc, track) => acc + track.track.duration_ms, 0);
    const totalDurationFormatted = convertMilliseconds(totalDurationMs);

    return {
      name: playlist.name,
      duration: totalDurationFormatted,
      url: playlistUrl,
      image: playlistImage,
    };
  } catch (error) {
    console.error('Error al obtener las canciones de la playlist:', error);
    throw error;
  }
}

// Ruta por defecto para mostrar que el servidor está corriendo
app.get('/', (req, res) => {
  res.send('El servidor de Sortify está corriendo');
});

// Ruta para obtener las playlists y guardar los resultados
app.get('/playlists', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Autorización no proporcionada' });
    }

    const token = authHeader.split(' ')[1];
    spotifyApi.setAccessToken(token);

    const user = await spotifyApi.getMe();
    const emergencyFilePath = 'src/playlists.json';
    let playlists;

    if (fs.existsSync(emergencyFilePath)) {
      playlists = JSON.parse(fs.readFileSync(emergencyFilePath, 'utf-8'));
    } else {
      playlists = [];
      let offset = 0;
      let results;

      do {
        results = await spotifyApi.getUserPlaylists(user.body.id, { limit: 50, offset });
        playlists.push(...results.body.items);
        offset += results.body.items.length;
      } while (results.body.next);

      fs.writeFileSync(emergencyFilePath, JSON.stringify(playlists, null, 4), 'utf-8');
    }

    const playlistDurations = await Promise.all(playlists.map(getPlaylistTracks));

    playlistDurations.sort((a, b) => {
      const durationA = a.duration.days * 86400000 + a.duration.hours * 3600000 + a.duration.minutes * 60000 + a.duration.seconds * 1000;
      const durationB = b.duration.days * 86400000 + b.duration.hours * 3600000 + b.duration.minutes * 60000 + b.duration.seconds * 1000;
      return (durationA - durationB) * (req.query.order === 'asc' ? 1 : -1);
    });

    const sortedPlaylists = playlistDurations.reduce((acc, playlist) => {
      acc[playlist.name] = {
        duration: playlist.duration,
        url: playlist.url,
        image: playlist.image,
      };
      return acc;
    }, {});

    const resultsFilePath = 'src/results.json';
    fs.writeFileSync(resultsFilePath, JSON.stringify(sortedPlaylists, null, 4), 'utf-8');

    res.json(sortedPlaylists);
  } catch (error) {
    console.error('Error en la ruta /playlists:', error);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud', details: error.message });
  }
});

app.post('/store-token', (req, res) => {
  const { token } = req.body; // Destructura el token desde req.body

  if (!token) {
    return res.status(400).send('Token no proporcionado');
  }

  console.log('Token recibido:', token);

  // Aquí podrías almacenar el token en una base de datos o realizar otras acciones
  res.status(200).send('Token almacenado exitosamente');
});



// Ruta para obtener el token almacenado
app.get('/get-token', (req, res) => {
  const token = localStorage.getItem('spotify_access_token');
  if (token) {
    res.status(200).json({ token });
  } else {
    res.status(404).json({ error: 'Token no encontrado' });
  }
});


// Inicializa la aplicación para escuchar en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
