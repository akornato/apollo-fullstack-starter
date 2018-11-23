import React from 'react';
import ReactDOM from 'react-dom';
import { HttpLink, InMemoryCache, ApolloClient, ApolloLink } from 'apollo-boost';
import { onError } from 'apollo-link-error';
import { AUTH_TOKEN, apiURL } from './constants';
import RootContainer from './components/RootContainer';
import { ApolloProvider } from 'react-apollo';

import './css/index.css';
import './css/vendor/tailwind.css';
import './css/vendor/antd.css';

const httpLink = new HttpLink({ uri: apiURL });

const authLink = new ApolloLink((operation, forward) => {
  // get the authentication token from local storage if it exists
  const tokenValue = localStorage.getItem(AUTH_TOKEN);
  // return the headers to the context so server can read them
  operation.setContext({
    headers: {
      Authorization: tokenValue ? `Bearer ${tokenValue}` : '',
    },
  });
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <RootContainer />
  </ApolloProvider>,
  document.getElementById('root')
);
