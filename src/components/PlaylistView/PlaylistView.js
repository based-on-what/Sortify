import React from 'react';
import './PlaylistView.css'; 

const handlePlaylistClick = (url) => {
  window.open(url, '_blank'); // Abre la URL en una nueva pestaña
};

const PlaylistView = ({ playlists, isDarkMode }) => {
  return (
    <div className="playlist-grid">
      {playlists.map((playlist) => (
        <div key={playlist.id} className={`playlist-item border`} style={{ cursor: 'pointer' }} onClick={() => handlePlaylistClick(playlist.url)}>
          <div className="playlist-name">
            {playlist.name}
          </div>
          <img src={playlist.image} alt={playlist.name} className="playlist-image" />
          <div className="playlist-duration">{`${playlist.duration.days} days, ${playlist.duration.hours} hours, ${playlist.duration.minutes} minutes, ${playlist.duration.seconds} seconds`}</div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistView;
