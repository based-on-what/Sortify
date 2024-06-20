import React from 'react';
import axios from 'axios';

const OrdenarPlaylists = ({ playlists, setPlaylists }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const invertPlaylists = async (orden) => {
    setIsAnimating(true);
    try {
      const response = await axios.post('http://localhost:5000/api/invert-playlists', {
        playlists: playlists,
        orden: orden
      });
      const sortedPlaylists = response.data.sorted_playlists;
      setPlaylists(sortedPlaylists);
    } catch (error) {
      console.error('Error al obtener playlists ordenadas:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div>
      <button onClick={() => invertPlaylists(0)}>Ordenar de menor a mayor duración</button>
      <button onClick={() => invertPlaylists(1)}>Ordenar de mayor a menor duración</button>
    </div>
  );
};

export default OrdenarPlaylists;
