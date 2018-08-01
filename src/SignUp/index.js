import React, { Component } from "react";
import SignUpView from "./SignUpView";
import { withRouter } from "react-router";
import app from "../base";

class SignUpContainer extends Component {
  handleSignUp = async event => {
    event.preventDefault();
    const { email, password, name } = event.target.elements;
    try {
      var ret = await app
        .auth()
        .createUserWithEmailAndPassword(email.value, password.value);
      // Create user in users table. If email already existed
      // createUserWithEmailAndPassword throws error
      let usersRef = app.database().ref("users");
      usersRef.child(ret.user.uid).set({
       name : name.value,
       email : email.value
      });
      this.props.history.push("/");
    } catch (error) {
      alert(error);
    }
  };

  render() {
    return <SignUpView onSubmit={this.handleSignUp} />;
  }
}

export default withRouter(SignUpContainer);