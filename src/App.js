import React, { Component } from 'react';
import RegionSelect from 'react-region-select';
import firebase from 'firebase';
import 'firebase/firestore';
import axios from 'axios';

import Popup from './components/Popup';

import './App.css';

const repository =
  'https://raw.githubusercontent.com/SouthEugeneRoboticsTeam/bucket-dataset/master/images/';

firebase.initializeApp({
  apiKey: 'AIzaSyCNTrciChFb30GbolZPhIe_Hayhohl2DjU',
  authDomain: 'tagger-9c2dc.firebaseapp.com',
  projectId: 'tagger-9c2dc'
});

const db = firebase.firestore();
const imagesRef = db.collection('images');

const instructions =
  "Please select each white 5 gallon bucket in the image shown to you individually. In other words, if there's one bucket in the image, draw one box around that bucket. If there are two buckets, draw a box around each bucket individually. Having a little bit of padding on any side of the bucket is alright, but try to be as close to the bucket as possible. A little bit of excess is better than leaving out part of the bucket. If less than 1/4 of the bucket is shown due to it being cut off by the frame or another object, use your judgement about whether a computer could be expected to recognize it as a bucket. Then press Enter to confirm your selections.";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { regions: [], image: false, images: [], popup: false };

    this.onChange = this.onChange.bind(this);
    this.regionRenderer = this.regionRenderer.bind(this);
    this.removeRegion = this.removeRegion.bind(this);
    this.loadNextImage = this.loadNextImage.bind(this);
  }

  componentWillMount() {
    document.addEventListener('keydown', this.onKeyPressed.bind(this));

    axios
      .get(`${repository}_manifest.json?no-cache=${Math.random()}`)
      .then(res => {
        this.setState({ images: res.data });
        this.loadNextImage();
      });
  }

  onKeyPressed({ key }) {
    if (key === 'Enter') {
      if (this.state.regions.length > 0) {
        const plural = this.state.regions.length > 1;
        const confirmation = window.confirm(
          `Are you sure there ${plural ? 'are' : 'is'} ${this.state.regions
            .length} bucket${plural ? 's' : ''} in this image?`
        );

        if (confirmation) {
          this.saveRegions(this.state.image, this.state.regions);
          this.loadNextImage();
        }
      } else {
        window.alert(
          'There is at least 1 bucket in this image. Please select all buckets in the image before pressing the Enter key.'
        );
      }
    }
  }

  saveRegions(image, regions) {
    const roundedRegions = regions.map(({ x, y, width, height }) => {
      return {
        x: Math.max(x, 0),
        y: Math.max(y, 0),
        width: Math.min(width, 100),
        height: Math.min(height, 100)
      };
    });

    imagesRef
      .add({
        image,
        regions: roundedRegions
      })
      .then(docRef => {
        console.log(`Successfully wrote to ${docRef.id}`);
      })
      .catch(err => {
        console.log(`Error writing document: ${err}`);
      });
  }

  loadNextImage() {
    this.setState({
      regions: [],
      image: this.state.images[
        Math.floor(Math.random() * this.state.images.length)
      ]
    });
  }

  removeRegion(index) {
    const regions = this.state.regions;
    regions.splice(index, 1);

    this.setState({ regions });
  }

  regionRenderer(regionProps) {
    return (
      <div
        className="remove"
        onClick={() => this.removeRegion(regionProps.index)}
      >
        X
      </div>
    );
  }

  onChange(regions) {
    this.setState({ regions });
  }

  togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup
    });
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          Tagger{!!this.state.image && ` (${this.state.image})`}
        </div>
        {!!this.state.image && (
          <RegionSelect
            constraint={true}
            regions={this.state.regions}
            onChange={this.onChange}
            regionRenderer={this.regionRenderer}
          >
            <img
              alt="bucket"
              width="720px"
              src={`${repository}${this.state.image}`}
            />
          </RegionSelect>
        )}

        <br />

        <button onClick={this.togglePopup.bind(this)}>Show Instructions</button>

        {this.state.showPopup ? (
          <Popup
            header="Instructions"
            text={instructions}
            closePopup={this.togglePopup.bind(this)}
          />
        ) : null}
      </div>
    );
  }
}

export default App;
