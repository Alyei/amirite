import React from "react";
import { Button, ButtonGroup, Navbar, Nav, NavItem } from "react-bootstrap";

import "../../css/navigation.css";

import Overlay from "./Overlay.js";

export default class NavBar extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      defTab: 1,
      prelogin: true
    };
    this.OpenRegister = this.OpenRegister.bind(this);
    this.OpenLogin = this.OpenLogin.bind(this);
    this.OverlayClose = this.OverlayClose.bind(this);
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

  MainNavElements() {
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
  PostLoginNavElements() {
    const NavElements = (
      <Nav pullRight className="navbar-nav navbar-right">
        <NavItem className="LogRegForm">
          <label text={this.props.user.username}>
            
          </label>
        </NavItem>
        <NavItem className="LogRegForm">
          <img src={this.props.user.image}>
          
          </img>
        </NavItem>
      </Nav>
    );
  }

  render() {
    const NavBare = (
      <Navbar className="MainNavBar" fixedTop inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand className="MainNavBarBrand">Amirite</Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse className="navbar-collapse">
          {this.state.prelogin === true ? this.MainNavElements() : this.PostLoginNavElements()}
        </Navbar.Collapse>
      </Navbar>
    );
    return <div>{NavBare}
      <Overlay
        defTab={this.state.defTab}
        showModal={this.state.showModal}
        overlayClose={this.OverlayClose}
      />
      {this.props.children}
      </div>;
  }
}
