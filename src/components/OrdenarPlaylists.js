// OrdenarPlaylists.js
import React, { useState } from 'react';

function OrdenarPlaylists({ playlists }) {
  const [reversedPlaylists, setReversedPlaylists] = useState([]);

  // Función para invertir el orden de las playlists
  const invertPlaylists = () => {
    // Crea una copia de las playlists y reviértela
    const reversed = [...playlists].reverse();
    setReversedPlaylists(reversed);
  };

  return (
    <div>
      {/* Botón para invertir las playlists */}
      <button onClick={invertPlaylists}>Invertir Playlists</button>
      {/* Resto de tu lógica para mostrar las playlists */}
    </div>
  );
}

export default OrdenarPlaylists;
