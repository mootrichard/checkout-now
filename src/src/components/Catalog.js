import React, { Component } from 'react';
import * as firebase from 'firebase';
import 'firebase/auth';

import Styles from '../styles/styles';

class Catalog extends Component {
  constructor(props){
    super(props)

    this.state = {
      catalog: []
    }
  }

  componentWillMount() {
    const that = this;
      fetch('/catalog', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idToken: window.localStorage.getItem("token")
        }),
        method: 'POST',
      }).then( response => response.json() ).then(jsonResp => {
        console.log(JSON.stringify(jsonResp, null, 2));
        that.setState({
          catalog: jsonResp
        })
      }).catch(function (error) {
        // Handle error
    });
  }

  render() {
    const { catalog } = this.state;
    return (
      <div style={{padding:"20px"}} >
        <h1 style={{padding:"20px"}}> Checkout Buttons </h1>
        {
          catalog.map((elem) => {
            const formattedPrice = `${(elem.price.amount/100).toFixed(2)}`
            return (
              <div>
                <h3> {elem.name} </h3>
                <p><strong>${formattedPrice}</strong></p>
                <a style={{textDecoration: "none"}} href={elem.checkoutUrl} ><button >Buy now</button></a>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Catalog;
