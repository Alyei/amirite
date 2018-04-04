import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';

import NavBar from './js/components/NavBar';
import HomePage from './js/pages/HomePage';
import HostGame from './js/components/HostGame';
import GameModeManager from './js/components/GameModeManager';

export default class Routes extends React.Component {
  constructor() {
    super();
    this.state = {
      isAuthenticated: false,
      username: undefined,
      navBarRef: undefined,
    };
    this.handleNotAuthenticated = this.handleNotAuthenticated.bind(this);
    this.handleSetAuth = this.handleSetAuth.bind(this);
  }
  async componentWillMount() {
    if (this.state.username === undefined) {
      await this.fetchUsername();
      console.log('after fetch', this.state);
    }
  }
  fetchUsername() {
    fetch('https://localhost:443/api/username', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          this.setState({ isAuthenticated: true });
          return res.json();
        } else if (res.status === 401) {
          this.setState({ isAuthenticated: false });
          return { username: undefined };
        } else {
          throw 'unexpected error';
        }
      })
      .then((resJson) => {
        this.setState({ username: resJson.username });
      });
  }

  handleSetAuth(authenticated, username) {
    this.setState({ isAuthenticated: authenticated, username: username });
  }

  handleNotAuthenticated() {
    this.Navbar.OpenLogin();
  }

  render() {
    return (
      <Router>
        <div>
          <NavBar
            onRef={(ref) => {
              this.Navbar = ref;
              this.setState({ navBarRef: ref });
            }}
            isAuthenticated={this.state.isAuthenticated}
            setAuth={this.handleSetAuth}
            username={this.state.username}
          />
          <Switch>
            <Route path="/" exact component={() => <HomePage />} />
            {this.state.navBarRef !== undefined &&
            this.state.username !== undefined ? (
              <div>
                <Route
                  path="/profile/:username"
                  component={(props) => (
                    <HostGame
                      isAuthenticated={this.state.isAuthenticated}
                      notAuth={this.handleNotAuthenticated}
                      username={this.state.username}
                      {...props}
                    />
                  )}
                />
                <Route
                  path="/game/:gameid"
                  component={(props) => (
                    <GameModeManager
                      NavBarRef={this.Navbar}
                      username={this.state.username}
                      {...props}
                    />
                  )}
                />
              </div>
            ) : null}
            <Route
              render={function() {
                return <p>404 not Found</p>;
              }}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}
