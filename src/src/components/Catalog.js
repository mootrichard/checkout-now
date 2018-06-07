import React, { Component } from 'react';
import * as firebase from 'firebase';
import 'firebase/auth';
import Clipboard from 'react-clipboard.js';

import Styles from '../styles/styles';

const localStyles = {
  buyBtn: {
    width: "100px",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#7e9aff",
    color: "white",
    fontWeight: "600",
    fontSize: "12pt"
  },
  btn: {
    width: "100px",
    padding: "10px",
    borderRadius: "5px",
    fontWeight: "600",
    fontSize: "10pt",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)"
  },
  gridItem: {
    margin: "20px auto",
    border: "1px solid black",
    borderRadius: "10px",
    width: "auto",
    padding: "20px"
  }
}

class Catalog extends Component {
  constructor(props){
    super(props)

    this.state = {
      catalog: []
    }
    this.copyClicked = this.copyClicked.bind(this);
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
        that.setState({
          catalog: jsonResp
        })
      }).catch(function (error) {
        // Handle error
    });
  }

  copyClicked(e) {

  }

  render() {
    const { catalog } = this.state;
    return (
      <div style={{padding:"20px"}} >
        <h1 style={{padding:"20px", textAlign: "center"}}> Checkout Buttons </h1>
        <div style={localStyles.grid}>
        {
          catalog.map((elem) => {
            const formattedPrice = `${(elem.price.amount/100).toFixed(2)}`
            return (
              <div style={localStyles.gridItem}>
                <h3> {elem.name} </h3>
                <p><strong>${formattedPrice}</strong></p>
                <a style={{textDecoration: "none"}} href={elem.checkoutUrl} >
                  <button className="buy-btn" style={localStyles.buyBtn} >Buy now</button>
                </a>
                <Clipboard style={localStyles.btn} data-clipboard-text={elem.checkoutUrl} >
                  Copy URL
                </Clipboard>
                <p><a href={elem.checkoutUrl}> {elem.checkoutUrl}</a></p>
              </div>
            )
          })
        }
        </div>
      </div>
    )
  }
}

export default Catalog;
