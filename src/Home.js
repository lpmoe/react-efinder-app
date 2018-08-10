import React from "react";
import logo from './logo.svg';

const Home = () => {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Welcome to eFinder!</h1>
            </header>
            <p className="App-intro">
                Find your dream job today!
            </p>
        </div>
    );
};

export default Home;