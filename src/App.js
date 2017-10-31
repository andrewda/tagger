import React, { Component } from 'react';
import RegionSelect from 'react-region-select';
import './App.css';

const repository = 'https://raw.githubusercontent.com/SouthEugeneRoboticsTeam/bucket-dataset/master/images/';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = { regions: [], image: '00001.jpg' };

    this.onChange = this.onChange.bind(this);
    this.regionRenderer = this.regionRenderer.bind(this);
    this.removeRegion = this.removeRegion.bind(this);
  }

  removeRegion(index) {
    const regions = this.state.regions;
    regions.splice(index, 1);

    this.setState({ regions });
  }

  regionRenderer(regionProps) {
		return (
			<div className="remove" onClick={() => this.removeRegion(regionProps.index)}>
        X
			</div>
		);
	}

  onChange(regions) {
    this.setState({ regions })
  }

  render() {
    return (
      <div className="App">
        <div class="header">
          Tagger
        </div>
        <RegionSelect
          constraint={true}
          regions={this.state.regions}
          onChange={this.onChange}
          regionRenderer={this.regionRenderer}>
          <img
            alt='bucket'
            width='600px'
            src={`${repository}${this.state.image}`} />
        </RegionSelect>
      </div>
    );
  }
}

export default App;
