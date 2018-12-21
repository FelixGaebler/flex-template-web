/* eslint-disable no-console */
import EditListingAvailabilityForm from './EditListingAvailabilityForm';

export const Empty = {
  component: EditListingAvailabilityForm,
  props: {
    onSubmit: values => {
      console.log('Submit EditListingAvailabilityForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save rules',
    updated: false,
    updateInProgress: false,
    availability: {
      calendar: {},
      onCreateAvailabilityException: () => console.log('onCreateAvailabilityException called'),
      onDeleteAvailabilityException: () => console.log('onDeleteAvailabilityException called'),
      onFetchAvailabilityExceptions: () => console.log('onFetchAvailabilityExceptions called'),
      onFetchBookings: () => console.log('onFetchBookings called'),
    },
  },
  group: 'forms',
};
