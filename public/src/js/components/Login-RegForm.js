import React from "react";
import { Button, FormGroup, FormControl } from "react-bootstrap";

export default class Form extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      repassword:"",
      email: ""
    };
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleValueChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    if (this.props.formType === "register") {
      return (
        <form action="/signup" method="post">
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
              value={this.state.password}
              name="repassword"
              onChange={this.handleValueChange}
              type="password"
              placeholder="Re-enter Password"
            />
          </FormGroup>
          <Button type="submit">Register</Button>
        </form>
      );
    } else if (this.props.formType === "login") {
      return (
        <form action="/login" method="post">
          <FormGroup id="formControlsUsername">
            <label>Username</label>
            <FormControl
              name="username"
              onChange={this.handleValueChange}
              value={this.state.username}
              type="text"
              placeholder="Enter Username"
            />
          </FormGroup>
          <FormGroup id="formControlsPassword">
            <label>Password</label>
            <FormControl
              name="password"
              onChange={this.handleValueChange}
              value={this.state.password}
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
