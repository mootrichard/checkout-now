import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/auth';

import Login from './components/Login';
import Callback from './components/Callback';

const config = {
  apiKey: "AIzaSyDrrp3ST84F35MLpjOysrG3X-VYhUq1j8o",
  authDomain: "checkout-now.firebaseapp.com",
  databaseURL: "https://checkout-now.firebaseio.com",
  projectId: "checkout-now",
  storageBucket: "checkout-now.appspot.com",
  messagingSenderId: "231244511458"
};


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      redirect: false
    }
  }

  componentWillMount(){
    firebase.initializeApp(config);
  }
  render() {
    const { redirect } = this.state;
    return (
      (redirect) ? <Redirect to="/catalog" /> :
      <div className="App">
        <Router>
          <div>
            <Route exact path="/" component={Login} />
            <Route path="/login" component={Login} />
            <Route path="/callback" component={Callback} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
