import React, { Component } from 'react';
import RegionSelect from 'react-region-select';
import firebase from 'firebase';
import 'firebase/firestore';
import axios from 'axios';
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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { regions: [], image: false, images: [] };

    this.onChange = this.onChange.bind(this);
    this.regionRenderer = this.regionRenderer.bind(this);
    this.removeRegion = this.removeRegion.bind(this);
    this.loadNextImage = this.loadNextImage.bind(this);
  }

  componentWillMount() {
    document.addEventListener('keydown', this.onKeyPressed.bind(this));

    axios.get(`${repository}_manifest.json`).then(res => {
      this.setState({ images: res.data });
      this.loadNextImage();
    });
  }

  onKeyPressed({ key }) {
    if (key === 'Enter') {
      if (this.state.regions.length > 0) {
        const plural = this.state.regions.length > 1;
        const confirmation = window.confirm(`Are you sure there ${plural ? 'are' : 'is'} ${this.state.regions.length} bucket${plural ? 's' : ''} in this image?`);

        if (confirmation) {
          this.saveRegions(this.state.image, this.state.regions);
          this.loadNextImage();
        }
      } else {
        window.alert('There is at least 1 bucket in this image. Please select all buckets in the image before pressing the Enter key.');
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
      </div>
    );
  }
}

export default App;
