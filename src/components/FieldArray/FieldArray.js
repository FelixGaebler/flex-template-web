import React from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { FieldArray } from 'react-final-form-arrays';

import css from './FieldArray.css';

const FieldArrayComponent = props => {
  const { rootClassName, className, id, name, children } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <FieldArray id={id} name={name} className={classes}>
      {children}
    </FieldArray>
  );
};

FieldArrayComponent.defaultProps = {
  className: null,
  rootClassName: null,
  id: null,
  label: null,
};

FieldArrayComponent.propTypes = {
  className: string,
  rootClassName: string,
  id: string,
  label: node,

  name: string.isRequired,
};

export default FieldArrayComponent;
