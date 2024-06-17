import React from 'react';
import './PlaylistView.css'; 

const PlaylistView = ({ playlists }) => {
  return (
    <div className="playlist-grid">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="playlist-item">
          {/* Envuelve el nombre de la playlist en un elemento <a> */}
          <a href={playlist.url} target="_blank" rel="noopener noreferrer" className="playlist-name">
            {playlist.name}
          </a>
          <img src={playlist.image} alt={playlist.name} className="playlist-image" />
          <div className="playlist-duration">{`Length: ${playlist.duration.days} days, ${playlist.duration.hours} hours, ${playlist.duration.minutes} minutes, ${playlist.duration.seconds} seconds`}</div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistView;

