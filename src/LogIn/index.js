import React, { Component } from "react";
import LogInView from "./LogInView";
import { withRouter } from "react-router";
import app from "../base";

class LogInContainer extends Component {
  handleLogin = async event => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    try {
      await app
        .auth()
        .signInWithEmailAndPassword(email.value, password.value);
      this.props.history.push("/");
    } catch (error) {
      alert(error);
    }
  };

  render() {
    return <LogInView onSubmit={this.handleLogin} />;
  }
}

export default withRouter(LogInContainer);