import axios from 'axios';
import queryString from 'query-string';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const RESPONSE_TYPE = 'token';  // Asegúrate de usar 'token' para el tipo de respuesta
const SCOPES = [
  'playlist-read-private',
  // Agrega otros permisos que necesites
];

export const getAuthUrl = () => {
    //console.log('LA REDIRECT URI ES: ', REDIRECT_URI)
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;
};

export const getToken = async (code) => {
  const response = await axios.post(TOKEN_ENDPOINT, queryString.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: process.env.REACT_APP_CLIENT_SECRET,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};
