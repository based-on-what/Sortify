import React from 'react';

const PlaylistView = ({ playlists }) => {
  return (
    <div>
      {Object.entries(playlists).map(([playlistName, playlistDetails]) => (
        <div key={playlistName} style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>{playlistName}</h2>
          <p>Duración: {playlistDetails.duration.dias} días, {playlistDetails.duration.horas} horas, {playlistDetails.duration.minutos} minutos, {playlistDetails.duration.segundos} segundos</p>
          <a href={playlistDetails.url} target="_blank" rel="noopener noreferrer">Escuchar en Spotify</a>
          <img src={playlistDetails.image} alt={playlistName} style={{ width: '200px', height: '200px' }} />
        </div>
      ))}
    </div>
  );
};

export default PlaylistView;
