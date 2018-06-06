import React, { Component } from 'react';
import * as firebase from 'firebase';
import 'firebase/auth';

import Styles from '../styles/styles';

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            password: '',
            isEmailLink: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.authorize = this.authorize.bind(this);
    }

    componentWillMount(){
        if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
            this.setState({
                isEmailLink: true
            })
            var email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
            }
            firebase.auth().signInWithEmailLink(email, window.location.href)
                .then(function (result) {
                    window.localStorage.removeItem('emailForSignIn');
                    firebase.auth().currentUser.getIdToken().then(function (idToken) {
                        document.getElementById('tokenInput').value = idToken;
                        document.getElementById('showCatalog').submit();
                    }).catch(function (error) {
                        // Handle error
                    });
                })
                .catch(function (error) {
                    // Some error occurred, you can inspect the code: error.code
                    // Common errors could be invalid email and invalid or expired OTPs.
                    console.log(error);
                });
        } else {

        }
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    authorize(){
        fetch("/authorize", {
            credentials: "include"
        }).then((response)=>{
            return response.text();
        }).then((text)=>{
            window.location = text;
        })
    }

    render(){
        const { isEmailLink } = this.state;
        return ( (isEmailLink) ?
            <div style={Styles.message} id="message">
                <h1 style={Styles.messageH1}>Logging In</h1>
            </div>
            :
            <div style={Styles.message} id="message">
                <h2 style={Styles.messageH2}>Welcome</h2>
                <h1 style={Styles.messageH1}>Checkout Now</h1>
                <p id="loading">Click below to connect your Square account.</p>
                <button style={Styles.messageA} id="authorize" onClick={this.authorize}>Connect</button>
                <form id="showCatalog" action="/catalog" method="POST">
                    <input name="idToken" id="tokenInput" type="hidden" value="" />
                </form>
            </div>
        )
    }
}

export default Login;
