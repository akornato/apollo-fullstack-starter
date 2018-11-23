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

class ClientAdditionalDataForm extends Component {
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
      <Form layout="vertical">
        <div className="flex-row flex-wrap mb-10 md:-mx-5">
          {['entityType', 'entitySubtype', 'employeeCount', 'contractorCount'].map(field => (
            <div key={field} className="w-full md:w-1/2 md:px-5">
              <Form.Item
                label={intl.get(field)}
                validateStatus={getFieldError(field) ? 'error' : ''}
                help={getFieldError(field) || ''}
              >
                {getFieldDecorator(field, {
                  initialValue: client[field],
                  rules: [
                    {
                      required: true,
                      message: intl.get('This field is required'),
                    },
                  ],
                })(<Input type={field.endsWith('Count') ? 'number' : 'text'} />)}
              </Form.Item>
            </div>
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
          {(updateClient, { error, loading }) => {
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
                          const fieldValues = getFieldsValue();
                          updateClient({
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

const WrappedForm = Form.create({})(ClientAdditionalDataForm);

const ClientAdditionalData = props => <WrappedForm {...props} />;

export default ClientAdditionalData;
