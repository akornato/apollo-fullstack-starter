import React, { Fragment, Component } from 'react';
import intl from 'react-intl-universal';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { Form, Input, Button } from 'antd';

import { myClientQuery } from '../ClientPage';

const mutation = gql`
  mutation($id: String!, $data: JSON!) {
    updateMyClient(id: $id, data: $data) {
      id
    }
  }
`;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class ClientEntityForm extends Component {
  hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }
  render() {
    const {
      client,
      form: {
        getFieldDecorator,
        getFieldsValue,
        isFieldsTouched,
        getFieldError,
        getFieldsError,
        setFields,
        resetFields,
        validateFields,
      },
    } = this.props;

    return (
      <Form>
        <div className="flex-row flex-wrap mb-10">
          {[
            'entityName',
            'VATIN',
            'statisticalNumber',
            'courtRegisterNumber',
            'street',
            'postalCode',
            'city',
            'country',
            'www',
            'email',
          ].map(field => (
            <Form.Item
              key={field}
              className="w-full md:w-1/2"
              {...formItemLayout}
              label={intl.get(field)}
              validateStatus={getFieldError(field) ? 'error' : ''}
              help={getFieldError(field) || ''}
            >
              {getFieldDecorator(field, {
                initialValue: client.entity[field],
                rules: [
                  {
                    required: true,
                    message: intl.get('This field is required'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ))}
        </div>

        <Mutation
          mutation={mutation}
          onCompleted={() => {
            const fieldsValue = getFieldsValue();
            Object.keys(fieldsValue).forEach(
              key =>
                (fieldsValue[key] = {
                  value: fieldsValue[key],
                  touched: false,
                })
            );
            setFields(fieldsValue);
          }}
        >
          {(mutate, { error, loading }) => {
            return (
              <Fragment>
                <div className="flex-row justify-center mb-10">
                  <Button
                    className="w-24 mr-5"
                    disabled={!isFieldsTouched() || loading}
                    onClick={() => resetFields()}
                  >
                    {intl.get('Cancel')}
                  </Button>
                  <Button
                    className="w-24 ml-5"
                    type="primary"
                    disabled={!isFieldsTouched() || loading || this.hasErrors(getFieldsError())}
                    loading={loading}
                    onClick={() => {
                      validateFields((err, values) => {
                        if (!err) {
                          const fieldValues = {
                            entity: { __typename: 'Entity', ...getFieldsValue() },
                          };
                          mutate({
                            variables: {
                              id: client.id,
                              data: fieldValues,
                            },
                            update: store => {
                              const data = store.readQuery({
                                query: myClientQuery,
                                variables: { id: client.id },
                              });
                              data.myClient = {
                                ...data.myClient,
                                ...fieldValues,
                              };
                              store.writeQuery({
                                query: myClientQuery,
                                variables: { id: client.id },
                                data,
                              });
                            },
                          });
                        }
                      });
                    }}
                  >
                    {intl.get('Save')}
                  </Button>
                </div>
                {error && <div className="text-red">{error.message}</div>}
              </Fragment>
            );
          }}
        </Mutation>
      </Form>
    );
  }
}

const WrappedForm = Form.create({})(ClientEntityForm);

const ClientEntityData = props => <WrappedForm {...props} />;

export default ClientEntityData;
