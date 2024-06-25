import React from 'react';
import './PlaylistView.css'; 
import './../../theme.css'; // Importa tu archivo de estilos

const handlePlaylistClick = (url) => {
  window.open(url, '_blank');
};

const PlaylistView = ({ playlists, isAnimating }) => {
  return (
    <div className={`playlist-grid ${isAnimating ? 'animate-reverse' : ''}`}>
      {playlists.map((playlist, index) => (
        <div 
          key={index} 
          className={`playlist-item border`} 
          style={{ cursor: 'pointer' }} 
          onClick={() => handlePlaylistClick(playlist.url)}
        >
          <div className="playlist-image">
            <img src={playlist.image} alt={playlist.name} />
          </div>
          <div className="playlist-name">
            {playlist.name}
          </div>
          <div className="playlist-duration">
            {`${playlist.total_duration.days} days, ${playlist.total_duration.hours} hours, ${playlist.total_duration.minutes} minutes, ${playlist.total_duration.seconds} seconds`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistView;
