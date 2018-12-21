import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconClose.css';

const IconClose = props => {
  const { className, rootClassName, size } = props;
  const classes = classNames(rootClassName || css.root, className);

  // Use given size as width and height or default to 12px
  const svgSize = size ? size : 12;

  return (
    <svg
      className={classes}
      width={svgSize}
      height={svgSize}
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-1 -1)" fillRule="evenodd">
        <rect transform="rotate(45 7 7)" x="-1" y="6" width="16" height="2" rx="1" />
        <rect transform="rotate(-45 7 7)" x="-1" y="6" width="16" height="2" rx="1" />
      </g>
    </svg>
  );
};

const { string } = PropTypes;

IconClose.defaultProps = {
  className: null,
  rootClassName: null,
};

IconClose.propTypes = {
  className: string,
  rootClassName: string,
};

export default IconClose;
