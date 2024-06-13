import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrdenarPlaylists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    // Realiza la solicitud GET al backend para obtener los datos de las playlists
    axios.get('http://localhost:8000/playlists')
      .then(response => {
        // Actualiza el estado con los datos recibidos
        setPlaylists(response.data);
      })
      .catch(error => {
        console.error('Error al obtener las playlists:', error);
      });
  }, []);

  return (
    <div>
      <h1>Ordenar Playlists</h1>
      <ul>
        {Object.entries(playlists).map(([name, duration]) => (
          <li key={name}>{name}: {JSON.stringify(duration)}</li>
        ))}
      </ul>
    </div>
  );
}

export default OrdenarPlaylists;
