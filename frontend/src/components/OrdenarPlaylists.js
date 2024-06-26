import React from 'react';
import axios from 'axios';

const OrdenarPlaylists = ({ setPlaylists }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const fetchSortedPlaylists = async (order) => {
    setIsAnimating(true);
    
    try {
      const response = await axios.get(`http://localhost:4000/playlists?order=${order}`);
      const sortedPlaylists = response.data;
      console.log('Playlists ordenadas:', sortedPlaylists);
      setPlaylists(sortedPlaylists);
    } catch (error) {
      console.error('Error al obtener playlists ordenadas:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div>
      <button onClick={() => fetchSortedPlaylists('asc')}>Ordenar de menor a mayor duración</button>
      <button onClick={() => fetchSortedPlaylists('desc')}>Ordenar de mayor a menor duración</button>
      {isAnimating && <p>Ordenando playlists...</p>}
    </div>
  );
};

export default OrdenarPlaylists;
