import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import intl from 'react-intl-universal';

import LanguageSelect from './LanguageSelect';
import NavBar from './NavBar';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import PassResetPage from './PassResetPage';
import PageNotFound from './PageNotFound';
import UserPage from './UserPage';
import ClientsListPage from './ClientsListPage';
import ClientPage from './ClientPage';

import { AUTH_TOKEN } from '../constants';
import { isTokenExpired } from '../helper/jwtHelper';

import plLocale from '../locales/pl-PL.json';
import enLocale from '../locales/en-GB.json';

const locales = {
  'pl-PL': plLocale,
  'en-GB': enLocale,
};

const ProtectedRoute = ({ component: Component, token, ...rest }) => {
  return token ? (
    <Route {...rest} render={matchProps => <Component {...matchProps} />} />
  ) : (
    <Redirect to="/login" />
  );
};

export default class RootContainer extends Component {
  constructor(props) {
    super(props);

    const currentLocale = localStorage.getItem('example-currentLocale');

    this.state = {
      localesLoaded: false,
      currentLocale: currentLocale || 'pl-PL',
      token: null,
    };
  }

  componentDidMount() {
    this.bootStrapData();
    this.loadLocales();
  }

  setLocale = locale => {
    this.setState({ currentLocale: locale }, this.loadLocales);
  };

  refreshToken = token => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN);
    }

    this.setState({
      token,
    });
  };

  bootStrapData = () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN);
      if (token !== null && token !== undefined) {
        const expired = isTokenExpired(token);
        if (!expired) {
          this.setState({ token: token });
        } else {
          localStorage.removeItem(AUTH_TOKEN);
          this.setState({ token: null });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  loadLocales() {
    const { currentLocale } = this.state;

    // init method will load CLDR locale data according to currentLocale
    // react-intl-universal is singleton, so you should init it only once in your app
    intl
      .init({
        currentLocale,
        locales,
      })
      .then(() => {
        // After loading CLDR locale data, start to render
        this.setState({ localesLoaded: true });
        localStorage.setItem('example-currentLocale', currentLocale);
      });
  }

  render() {
    const { refreshToken, setLocale } = this;
    const { currentLocale, localesLoaded, token } = this.state;

    return (
      localesLoaded && (
        <Router>
          <div className="container">
            {token && (
              <Route
                children={({ location: { pathname } }) =>
                  !pathname.includes('/document/') && (
                    <NavBar pathname={pathname} token={token} refreshToken={refreshToken} />
                  )
                }
              />
            )}
            {!token && <div className="fixed pin background-image" />}
            <Switch>
              <Route
                exact
                path="/"
                render={props => (token ? <Redirect to="/clients" /> : <Redirect to="/login" />)}
              />

              <ProtectedRoute token={token} path="/dpo" component={UserPage} />

              <ProtectedRoute token={token} path="/clients" component={ClientsListPage} />

              <ProtectedRoute token={token} path="/client/:id" component={ClientPage} />

              <Route
                token={token}
                path="/login"
                render={props => <LoginPage refreshToken={refreshToken} />}
              />
              <Route
                token={token}
                path="/signup"
                render={props => <SignupPage refreshToken={refreshToken} />}
              />
              <Route
                token={token}
                path="/pass-reset"
                render={props => <PassResetPage refreshToken={refreshToken} />}
              />

              <Route component={PageNotFound} />
            </Switch>
            <LanguageSelect currentLocale={currentLocale} setLocale={setLocale} />
          </div>
        </Router>
      )
    );
  }
}
