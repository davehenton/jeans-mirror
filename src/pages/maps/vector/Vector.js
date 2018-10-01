import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import $ from 'jquery';
/* eslint-disable */
import 'imports-loader?jQuery=jquery,this=>window!jvectormap/jquery-jvectormap.min.js';
import 'imports-loader?jQuery=jquery,this=>window!jvectormap-world/jquery-jvectormap-world-mill-en.js';
/* eslint-enable */

import s from './Vector.scss';

const mapData = {
  map: 'world_mill_en',
  scaleColors: ['#C8EEFF', '#0071A4'],
  normalizeFunction: 'polynomial',
  focusOn: {
    x: 0.5359,
    y: 0.4,
    scale: 2.5,
  },
  zoomMin: 0.85,
  hoverColor: false,
  regionStyle: {
    initial: {
      fill: '#bdbdbd',
      'fill-opacity': 1,
      stroke: '#bdbdbd',
      'stroke-width': 0,
      'stroke-opacity': 0,
    },
    hover: {
      'fill-opacity': 0.8,
    },
  },
  markerStyle: {
    initial: {
      fill: '#dd5826',
      stroke: '#c54e22',
      'fill-opacity': 1,
      'stroke-width': 4,
      'stroke-opacity': 0.2,
      r: 5,
    },
    hover: {
      stroke: 'black',
      'stroke-width': 5,
    },
  },
  backgroundColor: '#eee',
  markers: [
    { latLng: [41.90, 12.45], name: 'Vatican City' },
    { latLng: [43.73, 7.41], name: 'Monaco' },
    { latLng: [-0.52, 166.93], name: 'Nauru' },
    { latLng: [-8.51, 179.21], name: 'Tuvalu' },
    { latLng: [43.93, 12.46], name: 'San Marino' },
    { latLng: [47.14, 9.52], name: 'Liechtenstein' },
    { latLng: [7.11, 171.06], name: 'Marshall Islands' },
    { latLng: [17.3, -62.73], name: 'Saint Kitts and Nevis' },
    { latLng: [3.2, 73.22], name: 'Maldives' },
    { latLng: [35.88, 14.5], name: 'Malta' },
    { latLng: [12.05, -61.75], name: 'Grenada' },
    { latLng: [13.16, -61.23], name: 'Saint Vincent and the Grenadines' },
    { latLng: [13.16, -59.55], name: 'Barbados' },
    { latLng: [17.11, -61.85], name: 'Antigua and Barbuda' },
    { latLng: [-4.61, 55.45], name: 'Seychelles' },
    { latLng: [7.35, 134.46], name: 'Palau' },
    { latLng: [42.5, 1.51], name: 'Andorra' },
    { latLng: [14.01, -60.98], name: 'Saint Lucia' },
    { latLng: [6.91, 158.18], name: 'Federated States of Micronesia' },
    { latLng: [1.3, 103.8], name: 'Singapore' },
    { latLng: [1.46, 173.03], name: 'Kiribati' },
    { latLng: [-21.13, -175.2], name: 'Tonga' },
    { latLng: [15.3, -61.38], name: 'Dominica' },
    { latLng: [-20.2, 57.5], name: 'Mauritius' },
    { latLng: [26.02, 50.55], name: 'Bahrain' },
    { latLng: [0.33, 6.73], name: 'S?o Tom? and Pr?ncipe' },
  ],
};

class VectorMap extends React.Component {

  componentDidMount() {
    $(this.vectorMap).vectorMap(mapData);
  }

  render() {
    return (
      <div>
        <div
          className={`${s.contentMap} vector-map`} ref={(r) => {
            this.vectorMap = r;
          }}
        />
        <header className="page-title">
          <h1 className="m-0 mb-sm">Vector <span className="fw-semi-bold">Maps</span></h1>
          <p className="page-title fs-sm m-0">
            <span className="fw-semi-bold">1 656 843</span>
            <span className="ml-xs circle bg-gray"><i className="text-gray-lighter fa fa-circle" /></span>
          </p>
        </header>
      </div>);
  }

}

export default withStyles(s)(VectorMap);
