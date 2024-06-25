import React from 'react';
import axios from 'axios';

const OrdenarPlaylists = ({ setPlaylists }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const fetchSortedPlaylists = async (orden) => {
    setIsAnimating(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/playlists?orden=${orden}`);
      const sortedPlaylists = response.data;
      console.log('Playlists ordenadas:', sortedPlaylists); // Muestra los resultados en la consola
      setPlaylists(sortedPlaylists);
    } catch (error) {
      console.error('Error al obtener playlists ordenadas:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div>
      <button onClick={() => fetchSortedPlaylists(0)}>Ordenar de menor a mayor duración</button>
      <button onClick={() => fetchSortedPlaylists(1)}>Ordenar de mayor a menor duración</button>
      {isAnimating && <p>Ordenando playlists...</p>}
    </div>
  );
};

export default OrdenarPlaylists;
