import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import FieldArray from './FieldArray';
import { FieldTextInput, InlineTextButton } from '../../components/';
import { Button } from '..';
import css from './FieldArray.css';

const formName = 'Styleguide.FieldArray.Form';

const FormComponent = props => (
  <FinalForm
    {...props}
    form={formName}
    onSubmit={props.onSubmit}
    mutators={{
      ...arrayMutators,
    }}
    render={fieldRenderProps => {
      const {
        handleSubmit,
        form: {
          mutators: { push, pop },
        }, // injected from final-form-arrays above
        pristine,
        invalid,
        submitting,
        id,
      } = fieldRenderProps;

      const submitDisabled = invalid || pristine || submitting;
      const fieldName = `${id}.FieldArray`;

      return (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <div className={css.buttonsWrapper}>
            <InlineTextButton type="button" onClick={() => push(fieldName, undefined)}>
              Add row
            </InlineTextButton>
            <InlineTextButton type="button" onClick={() => pop(fieldName)}>
              Remove row
            </InlineTextButton>
          </div>

          <FieldArray id={id} name={fieldName}>
            {({ fields }) =>
              fields.map((name, index) => (
                <div key={name}>
                  <label>Row {index + 1}</label>
                  <div className={css.formRow}>
                    <FieldTextInput
                      className={css.field}
                      type="text"
                      id={`${name}.input`}
                      name={`${name}.input`}
                      label="Write something:"
                    />

                    <span onClick={() => fields.remove(index)} style={{ cursor: 'pointer' }}>
                      remove
                    </span>
                  </div>
                </div>
              ))
            }
          </FieldArray>

          <Button style={{ marginTop: 24 }} type="submit" disabled={submitDisabled}>
            Submit
          </Button>
        </form>
      );
    }}
  />
);

export const FieldArrayExample = {
  component: FormComponent,
  props: {
    onChange: formState => {
      if (Object.keys(formState.values).length > 0) {
        console.log('form values changed to:', formState.values);
      }
    },
    onSubmit: values => {
      console.log('Submit values of FieldArray: ', values);
    },
    id: 'array',
  },
  group: 'inputs',
};
