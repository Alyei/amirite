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
    this.CloseModal = this.CloseModal.bind(this);
    this.handleLinkToProfile = this.handleLinkToProfile.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  CloseModal() {
    this.setState({ showModal: false });
  }
  OpenLogin() {
    this.setState({ defTab: 1, showModal: true });
  }
  OpenRegister() {
    this.setState({ defTab: 2, showModal: true });
  }

  handleLinkToProfile(event) {
    this.props.history.push({
      pathname: '/profile/' + this.props.username,
    });
  }

  handleLogout(event) {
    fetch('https://localhost:443/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          console.log(this);
          this.props.history.push({ pathname: '/' });
          this.props.setAuth(false, null);
        } else return { status: res.status };
      })
      .catch((error) => {
        console.log(error);
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
          <MenuItem onClick={this.handleLinkToProfile}>Profile</MenuItem>
          <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
        </NavDropdown>
      </Nav>
    );
    return NavElements;
  }

  render() {
    const NavBare = (
      <Navbar className="MainNavBar" staticTop inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand className="MainNavBarBrand">
            <a href="/" className="navbar-left">
              <img src="logo.svg" className="NavBarHeaderLogo" /> amirite
            </a>
          </Navbar.Brand>
          {this.props.isAuthenticated === false ? <Navbar.Toggle /> : null}
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
          closeModal={this.CloseModal}
          setAuth={this.props.setAuth}
        />
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(NavBar);
