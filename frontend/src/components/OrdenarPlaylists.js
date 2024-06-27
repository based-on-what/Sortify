import React from 'react';
import axios from 'axios';

const OrdenarPlaylists = ({ setPlaylists }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const fetchSortedPlaylists = async (order) => {
    setIsAnimating(true);

    console.log('SE ESTÁ INTENTANDO ORDENAR');
    
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('Token de acceso no disponible');
      setIsAnimating(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:4000/playlists?order=${order}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const sortedPlaylists = response.data;
      console.log('Playlists ordenadas:', sortedPlaylists);
      setPlaylists(sortedPlaylists);
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        console.error('Error en la respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta a la solicitud:', error.request);
      } else {
        // Algo pasó al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
      }
      console.error('Config:', error.config);
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
