//https://maksimivanov.com/posts/firebase-react-tutorial

import React, { Component } from 'react';
import 'typeface-roboto'
// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import app from "./base";
import Home from "./Home";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import Profile from "./Profile";


/*class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}*/

class App extends Component {
  state = { loading: true, authenticated: false, user: null, currentUser: null };

  componentWillMount() {
    app.auth().onAuthStateChanged(user => {
      // console.log("MY USER: " + JSON.stringify(user));
      if (user) {
        this.setState({
          authenticated: true,
          currentUser: user,
          loading: false
        });
      } else {
        this.setState({
          authenticated: false,
          currentUser: null,
          loading: false
        });
      }
    });
  }

  render() {
    const { authenticated, loading, currentUser } = this.state;

    if (loading) {
      return <p>Loading..</p>;
    }

    return (
      <Router>
        <div>
          <PrivateRoute
            exact
            path="/"
            component={Home}
            authenticated={authenticated}
          />
          <Route exact path="/login" component={LogIn} />
          <Route exact path="/signup" component={SignUp} />
          {/*<Route exact path="/profile" something="foo" component={Profile} currentUser={currentUser} />*/}
            <Route exact path='/profile' render={(props) => (
                <Profile {...props} uid={currentUser.uid} />
            )}/>
        </div>
      </Router>
    );
  }
}

export default App;