import { types as sdkTypes } from './util/sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;

// An array of locations to show in the LocationAutocompleteInput when
// the input is in focus but the user hasn't typed in any search yet.
//
// Each item in the array should be an object with a unique `id` (String) and a
// `predictionPlace` (util.types.place) properties.
export default [
  {
    id: 'default-zurich',
    predictionPlace: {
      address: 'Kanton Zürich, Schweiz',
      bounds: new LatLngBounds(new LatLng(47.434662, 8.625334), new LatLng(47.320258, 8.447982)),
    },
  },
  {
    id: 'default-aargau',
    predictionPlace: {
      address: 'Kanton Aargau, Schweiz',
      bounds: new LatLngBounds(new LatLng(47.621104, 8.45511099999999), new LatLng(47.137478, 7.71357499999999)),
    },
  },
  {
    id: 'default-luzern',
    predictionPlace: {
      address: 'Kanton Luzern, Schweiz',
      bounds: new LatLngBounds(new LatLng(61.83657, 24.11838), new LatLng(61.42728, 23.5422)),
    },
  },
  // {
  //   id: 'default-bern',
  //   predictionPlace: {
  //     address: 'Bern, Schweiz',
  //     bounds: new LatLngBounds(new LatLng(46.99027, 7.49555), new LatLng(46.919033, 7.294318)),
  //   },
  // },
  // {
  //   id: 'default-basel',
  //   predictionPlace: {
  //     address: 'Basel, Schweiz',
  //     bounds: new LatLngBounds(new LatLng(47.589902, 7.634148), new LatLng(47.519342, 7.554664)),
  //   },
  // },
];
