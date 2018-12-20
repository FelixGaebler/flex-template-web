import React from 'react';
import { bool, object, string } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { FieldTextInput, FieldArray, IconClose, InlineTextButton } from '../../components';
import * as validators from '../../util/validators';

import PayoutDetailsAddress from './PayoutDetailsAddress';
import PayoutDetailsBankDetails from './PayoutDetailsBankDetails';
import PayoutDetailsPersonalDetails from './PayoutDetailsPersonalDetails';
import { stripeCountryConfigs } from './PayoutDetailsForm';
import css from './PayoutDetailsForm.css';

const PayoutDetailsFormCompanyComponent = ({ fieldRenderProps }) => {
  const {
    id,
    disabled,
    form,
    intl,
    values,
    form: {
      mutators: { push },
    },
  } = fieldRenderProps;
  const { country } = values;

  const companyNameLabel = intl.formatMessage({ id: 'PayoutDetailsForm.companyNameLabel' });
  const companyNamePlaceholder = intl.formatMessage({
    id: 'PayoutDetailsForm.companyNamePlaceholder',
  });
  const companyNameRequired = validators.required(
    intl.formatMessage({
      id: 'PayoutDetailsForm.companyNameRequired',
    })
  );

  const companyTaxIdLabel = intl.formatMessage({
    id: `PayoutDetailsForm.companyTaxIdLabel.${country}`,
  });
  const companyTaxIdPlaceholder = intl.formatMessage(
    {
      id: 'PayoutDetailsForm.companyTaxIdPlaceholder',
    },
    {
      idName: companyTaxIdLabel,
    }
  );
  const companyTaxIdRequired = validators.required(
    intl.formatMessage(
      {
        id: 'PayoutDetailsForm.companyTaxIdRequired',
      },
      {
        idName: companyTaxIdLabel,
      }
    )
  );

  const showPersonalAddressField =
    country &&
    stripeCountryConfigs(country).companyConfig &&
    stripeCountryConfigs(country).companyConfig.personalAddress;

  const showAdditionalOwnersField =
    country &&
    stripeCountryConfigs(country).companyConfig &&
    stripeCountryConfigs(country).companyConfig.additionalOwners;

  const hasAdditionalOwners = values.company && values.company.additionalOwners;
  const hasMaxNumberOfAdditionalOwners =
    hasAdditionalOwners && values.company.additionalOwners.length >= 4;
  return (
    <React.Fragment>
      {country ? (
        <React.Fragment>
          <div className={css.sectionContainer}>
            <h3 className={css.subTitle}>
              <FormattedMessage id="PayoutDetailsForm.companyDetailsTitle" />
            </h3>
            <FieldTextInput
              id="company.companyName"
              name="company.companyName"
              disabled={disabled}
              type="text"
              autoComplete="company-name"
              label={companyNameLabel}
              placeholder={companyNamePlaceholder}
              validate={companyNameRequired}
            />

            <FieldTextInput
              id="company.companyTaxId"
              name="company.companyTaxId"
              disabled={disabled}
              type="text"
              autoComplete="company-tax-id"
              label={companyTaxIdLabel}
              placeholder={companyTaxIdPlaceholder}
              validate={companyTaxIdRequired}
            />
          </div>

          <PayoutDetailsAddress
            country={country}
            intl={intl}
            disabled={disabled}
            form={form}
            fieldId="company.address"
          />

          <PayoutDetailsBankDetails country={country} disabled={disabled} fieldId="company" />

          <PayoutDetailsPersonalDetails
            intl={intl}
            disabled={disabled}
            values={values}
            country={country}
            fieldId="company"
          />

          {showPersonalAddressField ? (
            <PayoutDetailsAddress
              country={country}
              intl={intl}
              disabled={disabled}
              form={form}
              fieldId="company.personalAddress"
            />
          ) : null}

          {showAdditionalOwnersField ? (
            <div className={css.sectionContainer}>
              <FieldArray id={id} name={'company.additionalOwners'}>
                {({ fields }) =>
                  fields.map((name, index) => (
                    <div className={css.additionalOwnerWrapper} key={name}>
                      <div
                        className={css.fieldArrayRemove}
                        onClick={() => fields.remove(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconClose rootClassName={css.closeIcon} /> Remove person
                      </div>
                      <PayoutDetailsPersonalDetails
                        intl={intl}
                        disabled={disabled}
                        values={values}
                        country={country}
                        fieldId={`company.additionalOwners.${index}`}
                      />
                      {showPersonalAddressField ? (
                        <PayoutDetailsAddress
                          country={country}
                          intl={intl}
                          disabled={disabled}
                          form={form}
                          fieldId={`company.additionalOwners.${index}`}
                        />
                      ) : null}
                    </div>
                  ))
                }
              </FieldArray>

              {!hasAdditionalOwners || !hasMaxNumberOfAdditionalOwners ? (
                <InlineTextButton
                  type="button"
                  className={css.fieldArrayAdd}
                  onClick={() => push('company.additionalOwners', undefined)}
                >
                  <FormattedMessage id="PayoutDetailsForm.additionalOwnerLabel" />
                </InlineTextButton>
              ) : null}
            </div>
          ) : null}
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

PayoutDetailsFormCompanyComponent.defaultProps = {
  id: null,
  disabled: false,
};

PayoutDetailsFormCompanyComponent.propTypes = {
  id: string,
  disabled: bool,
  form: object.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const PayoutDetailsFormCompany = compose(injectIntl)(PayoutDetailsFormCompanyComponent);

export default PayoutDetailsFormCompany;
