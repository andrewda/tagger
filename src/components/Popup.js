import React, { Component } from 'react';
import './Popup.css';

class Popup extends Component {
  render() {
    return (
      <div className="popup">
        <div className="popup-inner">
          <h1 className="popup-header">{this.props.header}</h1>
          <p className="popup-body">{this.props.text}</p>
          <button onClick={this.props.closePopup}>Close</button>
        </div>
      </div>
    );
  }
}

export default Popup;
