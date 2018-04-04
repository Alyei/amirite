import React from 'react';
import { Button, FormGroup, FormControl } from 'react-bootstrap';

export default class AuthForm extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      repassword: '',
      email: '',
    };
    this.handleValueChange = this.handleValueChange.bind(this);
    this.onSignup = this.handleSignup.bind(this);
    this.onLogin = this.handleLogin.bind(this);
  }

  handleSignup(event) {
    event.preventDefault();
    fetch('https://localhost:443/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
      }),
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) return res.json();
        else return { status: res.status };
      })
      .then((responseJson) => {
        console.log(responseJson);
      });
  }
  handleLogin(event) {
    event.preventDefault();
    fetch('https://localhost:443/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then((responseJson) => {
        this.props.setAuth(true, responseJson.user.username);
        this.props.closeModal();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleValueChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    //#region Signup
    if (this.props.formType === 'register') {
      return (
        <form onSubmit={this.onSignup}>
          <FormGroup id="formControlsUsername">
            <label>Username</label>
            <FormControl
              value={this.state.username}
              name="username"
              onChange={this.handleValueChange}
              type="text"
              placeholder="Enter Username"
            />
          </FormGroup>
          <FormGroup id="formControlsEmail">
            <label>E-Mail</label>
            <FormControl
              value={this.state.email}
              name="email"
              onChange={this.handleValueChange}
              type="email"
              placeholder="Enter Email"
            />
          </FormGroup>
          <FormGroup id="formControlsPassword">
            <label>Password</label>
            <FormControl
              value={this.state.password}
              name="password"
              onChange={this.handleValueChange}
              type="password"
              placeholder="Enter Password"
            />
            <FormControl
              value={this.state.repassword}
              name="repassword"
              onChange={this.handleValueChange}
              type="password"
              placeholder="Re-enter Password"
            />
          </FormGroup>
          <Button type="submit">Register</Button>
        </form>
      );
      //#endregion Signup
    } else if (this.props.formType === 'login') {
      return (
        <form onSubmit={this.onLogin}>
          <FormGroup id="formControlsUsername">
            <label>Username</label>
            <FormControl
              value={this.state.username}
              name="username"
              onChange={this.handleValueChange}
              type="text"
              placeholder="Enter Username"
            />
          </FormGroup>
          <FormGroup id="formControlsPassword">
            <label>Password</label>
            <FormControl
              value={this.state.password}
              name="password"
              onChange={this.handleValueChange}
              type="password"
              placeholder="Enter Password"
            />
          </FormGroup>
          <Button type="submit">Login</Button>
        </form>
      );
    } else {
      return <p>formType does not match</p>;
    }
  }
}
