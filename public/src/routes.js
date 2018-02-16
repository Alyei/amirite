import { BrowserRouter as Router, Route } from 'react-router-dom';
import React from 'react';

import NavBar from './js/components/NavBar';
import HomePage from './js/pages/HomePage';
import Determination from './js/pages/Determination';
import HostGame from './js/components/HostGame';
import GameModeSelector from './js/components/GameModeManager';

export default class Routes extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <NavBar />
          <Route path="/" exact component={HomePage} />
          <Route path="/HostGame" component={() => <HostGame />} />
          <Route path="/game/:gameid" component={GameModeSelector} />
        </div>
      </Router>
    );
  }
}
