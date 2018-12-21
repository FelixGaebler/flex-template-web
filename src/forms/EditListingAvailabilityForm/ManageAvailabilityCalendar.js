import React, { Component } from 'react';
import { func, object, shape, string } from 'prop-types';
import {
  DayPickerSingleDateController,
  isSameDay,
  isInclusivelyBeforeDay,
  isInclusivelyAfterDay,
} from 'react-dates';
import { FormattedMessage } from 'react-intl';
import memoize from 'lodash/memoize';
import classNames from 'classnames';
import moment from 'moment';
import {
  ensureBooking,
  ensureAvailabilityException,
  ensureDayAvailabilityPlan,
} from '../../util/data';
import { DAYS_OF_WEEK } from '../../util/types';
import { monthIdString } from '../../util/dates';
import { IconArrowHead, IconSpinner } from '../../components';

import css from './ManageAvailabilityCalendar.css';

export const HORIZONTAL_ORIENTATION = 'horizontal';
const MAX_AVAILABILITY_EXCEPTIONS_RANGE = 180;
const TODAY_MOMENT = moment().startOf('day');
const END_OF_RANGE_MOMENT = TODAY_MOMENT.clone()
  .add(MAX_AVAILABILITY_EXCEPTIONS_RANGE - 1, 'days')
  .startOf('day');

const TABLE_BORDER = 2;
const TABLE_COLUMNS = 7;
const MIN_CONTENT_WIDTH = 272;
const MIN_CELL_WIDTH = Math.floor(MIN_CONTENT_WIDTH / TABLE_COLUMNS); // 38
const MAX_CONTENT_WIDTH_DESKTOP = 756;
const MAX_CELL_WIDTH_DESKTOP = Math.floor(MAX_CONTENT_WIDTH_DESKTOP / TABLE_COLUMNS); // 108

const dayCellWidth = (width, isWithSideNav) => {
  if (isWithSideNav) {
    return width > MAX_CONTENT_WIDTH_DESKTOP
      ? MAX_CELL_WIDTH_DESKTOP
      : Math.floor((width - TABLE_BORDER) / TABLE_COLUMNS);
  } else {
    return width > MIN_CONTENT_WIDTH
      ? Math.floor((width - TABLE_BORDER) / TABLE_COLUMNS)
      : MIN_CELL_WIDTH;
  }
};

const prevMonth = currentMoment =>
  currentMoment
    .clone()
    .subtract(1, 'months')
    .startOf('month');
const nextMonth = currentMoment =>
  currentMoment
    .clone()
    .add(1, 'months')
    .startOf('month');

const dateStartAndEndInUTC = date => {
  const start = moment(date)
    .utc()
    .startOf('day')
    .toDate();
  const end = moment(date)
    .utc()
    .add(1, 'days')
    .startOf('day')
    .toDate();
  return { start, end };
};

// outside range -><- today ... today+MAX_AVAILABILITY_EXCEPTIONS_RANGE -1 -><- outside range
const isDateOutsideRange = date => {
  return (
    !isInclusivelyAfterDay(date, TODAY_MOMENT) || !isInclusivelyBeforeDay(date, END_OF_RANGE_MOMENT)
  );
};

const isOutsideRange = memoize(isDateOutsideRange);

const isMonthInRange = monthMoment => {
  const isAfterThisMonth = monthMoment.isSameOrAfter(TODAY_MOMENT, 'month');
  const isBeforeEndOfRange = monthMoment.isSameOrBefore(END_OF_RANGE_MOMENT, 'month');
  return isAfterThisMonth && isBeforeEndOfRange;
};

const isPast = date => !isInclusivelyAfterDay(date, TODAY_MOMENT);
const isAfterEndOfRange = date => !isInclusivelyBeforeDay(date, END_OF_RANGE_MOMENT);

const isBooked = (bookings, day) => {
  return !!bookings.find(b => {
    const booking = ensureBooking(b);
    const start = booking.attributes.start;
    const end = booking.attributes.end;
    const dayInUTC = day.clone().utc();

    // '[)' means that the range start is inclusive and range end exclusive
    return dayInUTC.isBetween(moment(start).utc(), moment(end).utc(), null, '[)');
  });
};

const findException = (exceptions, day) => {
  return exceptions.find(exception => {
    const availabilityException = ensureAvailabilityException(exception.availabilityException);
    const start = availabilityException.attributes.start;
    const dayInUTC = day.clone().utc();
    return isSameDay(moment(start).utc(), dayInUTC);
  });
};

const isBlocked = (availabilityPlan, exception, date) => {
  const planEntries = ensureDayAvailabilityPlan(availabilityPlan).entries;
  const seatsFromPlan = planEntries.find(
    weekDayEntry => weekDayEntry.dayOfWeek === DAYS_OF_WEEK[date.isoWeekday() - 1]
  ).seats;

  const seatsFromException =
    exception && ensureAvailabilityException(exception.availabilityException).attributes.seats;

  const seats = exception ? seatsFromException : seatsFromPlan;
  return seats === 0;
};

const dateFlags = (availabilityPlan, exceptions, bookings, date) => {
  const exception = findException(exceptions, date);

  return {
    isOutsideRange: isOutsideRange(date),
    isSameDay: isSameDay(date, TODAY_MOMENT),
    isBlocked: isBlocked(availabilityPlan, exception, date),
    isBooked: isBooked(bookings, date),
    isInProgress: exception && exception.inProgress,
    isFailed: exception && exception.error,
  };
};

const renderDayContents = (calendar, availabilityPlan) => date => {
  const { exceptions = [], bookings = [] } = calendar[monthIdString(date)] || {};
  const { isOutsideRange, isSameDay, isBlocked, isBooked, isInProgress, isFailed } = dateFlags(
    availabilityPlan,
    exceptions,
    bookings,
    date
  );

  const dayClasses = classNames(css.default, {
    [css.outsideRange]: isOutsideRange,
    [css.today]: isSameDay,
    [css.blocked]: isBlocked,
    [css.reserved]: isBooked,
    [css.exceptionError]: isFailed,
  });

  return (
    <div className={css.dayWrapper}>
      <span className={dayClasses}>
        <span className={css.dayNumber}>{date.format('DD')}</span>
      </span>
      {isInProgress ? <IconSpinner rootClassName={css.inProgress} /> : null}
    </div>
  );
};

const draftException = (exceptions, start, end, seats) => {
  const draft = ensureAvailabilityException({ attributes: { start, end, seats } });
  return { availabilityException: draft };
};

class ManageAvailabilityCalendar extends Component {
  constructor(props) {
    super(props);

    // DOM refs
    this.dayPickerWrapper = null;
    this.dayPicker = null;

    this.state = {
      currentMonth: moment().startOf('month'),
      focused: true,
      date: null,
    };

    this.fetchMonthData = this.fetchMonthData.bind(this);
    this.onDayAvailabilityChange = this.onDayAvailabilityChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onMonthClick = this.onMonthClick.bind(this);
  }

  componentDidMount() {
    this.fetchMonthData(this.state.currentMonth);
    // Fetch next month too.
    this.fetchMonthData(nextMonth(this.state.currentMonth));
  }

  fetchMonthData(monthMoment) {
    const { availability, listingId } = this.props;

    // Don't fetch exceptions for past months or too far in the future
    if (isMonthInRange(monthMoment)) {
      // Use "today", if the first day of given month is in the past
      const start = isPast(monthMoment) ? TODAY_MOMENT.toDate() : monthMoment.toDate();

      // endOfRangeMoment, if the first day of given month is too far in the future
      const nextMonthMoment = nextMonth(monthMoment);
      const end = isAfterEndOfRange(nextMonthMoment)
        ? END_OF_RANGE_MOMENT.toDate()
        : nextMonthMoment.toDate();

      availability.onFetchAvailabilityExceptions({ listingId, start, end });

      const state = ['pending', 'accepted'].join(',');
      availability.onFetchBookings({ listingId, start, end, state });
    }
  }

  onDayAvailabilityChange(date, seats, exceptions) {
    const { availabilityPlan, listingId } = this.props;
    const { start, end } = dateStartAndEndInUTC(date);

    const planEntries = ensureDayAvailabilityPlan(availabilityPlan).entries;
    const seatsFromPlan = planEntries.find(
      weekDayEntry => weekDayEntry.dayOfWeek === DAYS_OF_WEEK[date.isoWeekday() - 1]
    ).seats;

    const currentException = findException(exceptions, date);
    const draft = draftException(exceptions, start, end, seatsFromPlan);
    const exception = currentException || draft;
    const hasAvailabilityException = currentException && currentException.availabilityException.id;

    if (hasAvailabilityException) {
      const id = currentException.availabilityException.id;
      const isResetToPlanSeats = seatsFromPlan === seats;

      if (isResetToPlanSeats) {
        this.props.availability.onDeleteAvailabilityException({ id, currentException: exception });
      } else {
        this.props.availability
          .onDeleteAvailabilityException({ id, currentException: exception })
          .then(r => {
            const params = { listingId, start, end, seats, currentException: exception };
            this.props.availability.onCreateAvailabilityException(params);
          });
      }
    } else {
      const params = { listingId, start, end, seats, currentException: exception };
      this.props.availability.onCreateAvailabilityException(params);
    }
  }

  onDateChange(date) {
    this.setState({ date });

    const { availabilityPlan, availability } = this.props;
    const calendar = availability.calendar;
    const { exceptions = [], bookings = [] } = calendar[monthIdString(date)] || {};
    const { isPast, isBlocked, isBooked, isInProgress } = dateFlags(
      availabilityPlan,
      exceptions,
      bookings,
      date
    );

    if (isBooked || isPast || isInProgress) {
      // Cannot allow or block a reserved or a past date or inProgress
      return;
    } else if (isBlocked) {
      this.onDayAvailabilityChange(date, 1, exceptions);
    } else {
      this.onDayAvailabilityChange(date, 0, exceptions);
    }
  }

  onFocusChange() {
    // Force the focused states to always be truthy so that date is always selectable
    this.setState({ focused: true });
  }

  onMonthClick(monthFn) {
    const onMonthChanged = this.props.onMonthChanged;
    this.setState(
      prevState => ({ currentMonth: monthFn(prevState.currentMonth) }),
      () => {
        // Callback function after month has been updated.
        // react-dates component has next and previous months ready (but inivisible),
        // we try to populate those invisible months before user advances there.
        this.fetchMonthData(monthFn(this.state.currentMonth));

        // If previous fetch for month data failed, try again.
        const monthId = monthIdString(this.state.currentMonth);
        const currentMonthData = this.props.availability.calendar[monthId];
        const { fetchError, fetchBookingsError } = currentMonthData || {};
        if (currentMonthData && (fetchError || fetchBookingsError)) {
          this.fetchMonthData(this.state.currentMonth);
        }

        if (onMonthChanged) {
          onMonthChanged(monthIdString(this.state.currentMonth));
        }
      }
    );
  }

  render() {
    const {
      className,
      rootClassName,
      listingId,
      availability,
      availabilityPlan,
      onMonthChanged,
      monthFormat,
      ...rest
    } = this.props;
    const { focused, date } = this.state;
    const { clientWidth: width } = this.dayPickerWrapper || { clientWidth: 0 };
    const hasWindow = typeof window !== 'undefined';
    const isWithSideNav = hasWindow && window.innerWidth >= 1024;

    const daySize = dayCellWidth(width, isWithSideNav);
    const calendarGridWidth = daySize * TABLE_COLUMNS + TABLE_BORDER;
    console.log(daySize, width);

    const calendar = availability.calendar;
    const currentMonthData = calendar[monthIdString(this.state.currentMonth)];
    const { fetchInProgress, fetchBookingsInProgress, fetchError, fetchBookingsError } =
      currentMonthData || {};
    const isMonthDataAvailable = currentMonthData && !fetchInProgress && !fetchBookingsInProgress;

    const classes = classNames(rootClassName || css.root, className);

    return (
      <div
        className={classes}
        ref={c => {
          this.dayPickerWrapper = c;
        }}
      >
        {width > 0 ? (
          <div style={{ width: `${calendarGridWidth}px` }}>
            <DayPickerSingleDateController
              {...rest}
              ref={c => {
                this.dayPicker = c;
              }}
              numberOfMonths={1}
              navPrev={<IconArrowHead direction="left" />}
              navNext={<IconArrowHead direction="right" />}
              weekDayFormat="ddd"
              daySize={daySize}
              renderDayContents={renderDayContents(calendar, availabilityPlan)}
              focused={focused}
              date={date}
              onDateChange={this.onDateChange}
              onFocusChange={this.onFocusChange}
              onPrevMonthClick={() => this.onMonthClick(prevMonth)}
              onNextMonthClick={() => this.onMonthClick(nextMonth)}
              hideKeyboardShortcutsPanel={width < 400}
              horizontalMonthPadding={9}
              renderMonthElement={({ month }) => (
                <div className={css.monthElement}>
                  <span className={css.monthString}>{month.format(monthFormat)}</span>
                  {!isMonthDataAvailable ? (
                    <IconSpinner rootClassName={css.monthInProgress} />
                  ) : null}
                </div>
              )}
            />
          </div>
        ) : null}
        {fetchError && fetchBookingsError ? (
          <p className={css.error}>
            <FormattedMessage id="EditListingAvailabilityForm.fetchMonthDataFailed" />
          </p>
        ) : null}
        <div className={css.legend} style={{ width: `${calendarGridWidth}px` }}>
          <div className={css.legendRow}>
            <span className={css.legendAvailableColor} />
            <span className={css.legendText}>
              <FormattedMessage id="EditListingAvailabilityForm.availableDay" />
            </span>
          </div>
          <div className={css.legendRow}>
            <span className={css.legendReservedColor} />
            <span className={css.legendText}>
              <FormattedMessage id="EditListingAvailabilityForm.bookedDay" />
            </span>
          </div>
          <div className={css.legendRow}>
            <span className={css.legendBlockedColor} />
            <span className={css.legendText}>
              <FormattedMessage id="EditListingAvailabilityForm.blockedDay" />
            </span>
          </div>
        </div>
      </div>
    );
  }
}

ManageAvailabilityCalendar.defaultProps = {
  className: null,
  rootClassName: null,

  // day presentation and interaction related props
  renderCalendarDay: undefined,
  renderDayContents: null,
  isDayBlocked: () => false,
  isOutsideRange,
  isDayHighlighted: () => false,
  enableOutsideDays: true,

  // calendar presentation and interaction related props
  orientation: HORIZONTAL_ORIENTATION,
  withPortal: false,
  initialVisibleMonth: null,
  numberOfMonths: 2,
  onOutsideClick() {},
  keepOpenOnDateSelect: false,
  renderCalendarInfo: null,
  isRTL: false,

  // navigation related props
  navPrev: null,
  navNext: null,
  onPrevMonthClick() {},
  onNextMonthClick() {},

  // internationalization
  monthFormat: 'MMMM YYYY',
  onMonthChanged: null,
};

ManageAvailabilityCalendar.propTypes = {
  className: string,
  rootClassName: string,
  availability: shape({
    calendar: object.isRequired,
    onFetchAvailabilityExceptions: func.isRequired,
    onFetchBookings: func.isRequired,
    onDeleteAvailabilityException: func.isRequired,
    onCreateAvailabilityException: func.isRequired,
  }).isRequired,
  onMonthChanged: func,
};

export default ManageAvailabilityCalendar;
