import React from 'react';
import axios from 'axios';

const OrdenarPlaylists = ({ setPlaylists }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const fetchSortedPlaylists = async (order) => {
    setIsAnimating(true);
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('Token de acceso no disponible');
      setIsAnimating(false);
      return;
    }
  
    console.log('Token de acceso:', token);
    console.log('Orden:', order);
  
    let retries = 3; // Intentar hasta 3 veces en caso de error 429 u otro error
    while (retries > 0) {
      try {
        const response = await axios.get(`http://localhost:4000/playlists?order=${order}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const sortedPlaylists = response.data;
        console.log('Playlists ordenadas:', sortedPlaylists);
        setPlaylists(sortedPlaylists);
        setIsAnimating(false);
        return; // Salir del bucle si la solicitud fue exitosa
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.warn('Demasiadas solicitudes. Reintentando...');
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
        } else {
          console.error('Error al realizar la solicitud:', error.message);
          setIsAnimating(false);
          return;
        }
      }
    }
    console.error('Se alcanzó el máximo de reintentos sin éxito.');
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
