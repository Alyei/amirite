import React from 'react';
import {
  Button,
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import '../../css/navigation.css';

import Overlay from './Overlay.js';

class NavBar extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      defTab: 1,
    };
    this.OpenRegister = this.OpenRegister.bind(this);
    this.OpenLogin = this.OpenLogin.bind(this);
    this.OverlayClose = this.OverlayClose.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  OverlayClose() {
    this.setState({ showModal: false });
  }
  OpenLogin() {
    this.setState({ defTab: 1, showModal: true });
  }
  OpenRegister() {
    this.setState({ defTab: 2, showModal: true });
  }

  handleLogout(event) {
    fetch('https://localhost:443/api/logout', {
      method: 'POST',
      credentials: 'include',
    }).then((res) => {
      console.log(res);
      if (res.status === 200) {
        console.log(this);
        this.props.history.push({ pathname: '/' });
        this.props.setAuth(false, null);
      } else return { status: res.status };
    });
  }

  PublicNavElements() {
    const NavElements = (
      <Nav pullRight className="navbar-nav navbar-right">
        <NavItem className="LogRegForm">
          <Button
            type="button"
            className="Main_LogReg"
            onClick={this.OpenLogin}
          >
            Login
          </Button>
        </NavItem>
        <NavItem className="LogRegForm">
          <Button
            type="button"
            className="Main_LogReg"
            onClick={this.OpenRegister}
          >
            Register
          </Button>
        </NavItem>
      </Nav>
    );
    return <div>{NavElements}</div>;
  }
  PrivateNavElements() {
    const NavElements = (
      <Nav pullRight className="navbar-nav navbar-right">
        <NavDropdown
          id={this.props.username || 'username'}
          title={this.props.username || 'test'}
          noCaret
        >
          <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
        </NavDropdown>
      </Nav>
    );
    return <div>{NavElements}</div>;
  }

  render() {
    const NavBare = (
      <Navbar className="MainNavBar" staticTop inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand className="MainNavBarBrand">Amirite</Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        {this.props.isAuthenticated === false ? (
          <Navbar.Collapse className="navbar-collapse">
            {this.PublicNavElements()}
          </Navbar.Collapse>
        ) : (
          this.PrivateNavElements()
        )}
      </Navbar>
    );
    return (
      <div>
        {NavBare}
        <Overlay
          defTab={this.state.defTab}
          showModal={this.state.showModal}
          overlayClose={this.OverlayClose}
          setAuth={this.props.setAuth}
        />
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(NavBar);
