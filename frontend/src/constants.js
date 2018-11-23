export const AUTH_TOKEN = 'AUTH_TOKEN';

export const apiURL =
  process.env.NODE_ENV === 'production'
    ? 'https://example.herokuapp.com/graphql'
    : 'http://localhost:4000/graphql';
