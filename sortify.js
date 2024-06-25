const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');
const fs = require('fs');
const { promisify } = require('util');
const { ThreadPoolExecutor } = require('promised-executor');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura dotenv para cargar las variables de entorno desde un archivo .env
dotenv.config();

// Configura la autenticación de Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
});

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

// Ruta para obtener las playlists y guardar los resultados
app.get('/playlists', async (req, res) => {
  try {
    const order = req.query.order === 'asc' ? 1 : -1;
    const user = await spotifyApi.getMe();
    console.log(`Obteniendo playlists de ${user.body.id}...`);

    const emergencyFilePath = 'src/playlists.json';
    let playlists;

    if (fs.existsSync(emergencyFilePath)) {
      console.log(`Archivo ${emergencyFilePath} encontrado. Cargando datos...`);
      playlists = JSON.parse(fs.readFileSync(emergencyFilePath, 'utf-8'));
    } else {
      playlists = [];
      let offset = 0;
      let results;

      do {
        results = await spotifyApi.getUserPlaylists(user.body.id, { limit: 50, offset });
        playlists.push(...results.body.items);
        offset += results.body.items.length;
        console.log(`Obteniendo playlists... ${offset} playlists obtenidas hasta ahora.`);
      } while (results.body.next);

      fs.writeFileSync(emergencyFilePath, JSON.stringify(playlists, null, 4), 'utf-8');
    }

    console.log('Usando promesas para obtener canciones de cada playlist...');

    const executor = new ThreadPoolExecutor({ maxWorkers: 20 });
    const playlistDurations = await executor.map(playlists, getPlaylistTracks);

    console.log('Ordenando playlists...');

    playlistDurations.sort((a, b) => {
      const durationA = a.duration.days * 86400000 + a.duration.hours * 3600000 + a.duration.minutes * 60000 + a.duration.seconds * 1000;
      const durationB = b.duration.days * 86400000 + b.duration.hours * 3600000 + b.duration.minutes * 60000 + b.duration.seconds * 1000;
      return (durationA - durationB) * order;
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
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

// Inicializa la aplicación para escuchar en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
