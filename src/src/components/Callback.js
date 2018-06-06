import React, { Component } from 'react';
import * as firebase from 'firebase';
import 'firebase/auth';

import Styles from '../styles/styles';

class Callback extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: null
        };
    }

    componentWillMount(){
        const search = new URLSearchParams(window.location.search);
        const callbackValues = {
            code: search.get('code'),
            state: search.get('state')
        };

        fetch('/code', {
            body: JSON.stringify(callbackValues),
            method: 'POST',
            referrer: 'no-referrer',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((data)=>{
            return data.json();
        }).then((data) => {
            const email = data.email;
            const that = this;
            const actionCodeSettings = {
                'url': "https://checkout-now.firebaseapp.com/",
                'handleCodeInApp': true
            };
            firebase.auth().sendSignInLinkToEmail(`${email}`, actionCodeSettings).then(function () {
                window.localStorage.setItem('emailForSignIn', `${email}`);
                //alert('An email was sent to ' + "${email}" + '. Please use the link in the email to sign-in.');
                //window.close();
                that.setState({
                    email: email
                });
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // [START_EXCLUDE]
                console.log(error);
                // [END_EXCLUDE]
            });
        }).catch((error) =>{
            console.log(error);
        })
    }

    render(){
        const { email } = this.state;
        return ( (email) ?
            <div style={Styles.message} id="message">
                <h1 style={Styles.messageH1}>Check your email {(this.state.email) ? this.state.email : "" } for your link to sign in!</h1>
                <h2 style={Styles.messageH2}>Feel free to close this window.</h2>
            </div> :
            <div style={Styles.message} id="message">
                <h1 style={Styles.messageH1}>Sending email...</h1>
            </div>
        )
    }
}

export default Callback;
