import React from "react";
import { Button, FormGroup, FormControl } from "react-bootstrap";

export default class Form extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      repassword: "",
      email: "",
      testi: "abc"
    };
    this.handleValueChange = this.handleValueChange.bind(this);
    this.onSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormSubmit(event) {
    event.preventDefault();
    fetch("https://localhost/api/signup", {
      method: "POST",
      body: JSON.stringify({
        username: "thisName",
        email: "thismail@react.com",
        password: "password"
      })
    })
      .then(res => {
        console.log(res);
        if (res.status === 200) return res.json();
        else return { status: res.status };
      })
      .then(responseJson => {
        console.log(responseJson.test, responseJson.status);
      });
  }
  handleValueChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    if (this.props.formType === "register") {
      return (
        <form action="/api/signup" onSubmit={this.onSubmit}>
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
    } else if (this.props.formType === "login") {
      return (
        <form action="/api/login" method="post">
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
