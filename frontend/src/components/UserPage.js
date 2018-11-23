import React, { Fragment, Component } from 'react';
import intl from 'react-intl-universal';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

import { Form, Input, Checkbox, Button, Spin } from 'antd';

const meUserQuery = gql`
  query {
    meUser {
      id

      firstName
      lastName
      email

      roles

      entity {
        entityName
        VATIN
        statisticalNumber
        courtRegisterNumber
        street
        postalCode
        city
        country
      }

      jobTitle

      agreedToMarketingCommunication
      agreedToPersonalDataProcessing
    }
  }
`;

const updateMeMutation = gql`
  mutation($data: JSON!) {
    updateMe(data: $data) {
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

class UserForm extends Component {
  hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }
  render() {
    const {
      user,
      form: {
        getFieldDecorator,
        getFieldValue,
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
        <div className="flex-row flex-wrap pt-16">
          {['firstName', 'lastName', 'email', 'jobTitle'].map(field => (
            <Form.Item
              key={field}
              className="w-full md:w-1/2"
              {...formItemLayout}
              label={intl.get(field)}
              validateStatus={getFieldError(field) ? 'error' : ''}
              help={getFieldError(field) || ''}
            >
              {getFieldDecorator(field, {
                initialValue: user[field],
                rules: [
                  ['email', 'role'].includes(field)
                    ? {}
                    : {
                        required: true,
                        message: intl.get('This field is required'),
                      },
                ],
              })(<Input disabled={['email', 'role'].includes(field)} />)}
            </Form.Item>
          ))}

          {[
            'entityName',
            'VATIN',
            'statisticalNumber',
            'courtRegisterNumber',
            'street',
            'postalCode',
            'city',
            'country',
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
                initialValue: user.entity[field],
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

        <div className="flex-row justify-center">
          <div className="flex-column">
            {['agreedToMarketingCommunication', 'agreedToPersonalDataProcessing'].map(field => (
              <Form.Item key={field}>
                {getFieldDecorator(field, {
                  initialValue: user[field],
                  valuePropName: 'checked',
                })(<Checkbox>{intl.get(field)}</Checkbox>)}
              </Form.Item>
            ))}
          </div>
        </div>

        <Mutation
          mutation={updateMeMutation}
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
          {(mutate, { error, loading }) => (
            <Fragment>
              <div className="flex-row justify-center">
                <Form.Item>
                  <Button
                    className="w-24 mr-5"
                    disabled={!isFieldsTouched() || loading}
                    onClick={() => {
                      resetFields();
                    }}
                  >
                    {intl.get('Cancel')}
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button
                    className="w-24 ml-5"
                    type="primary"
                    disabled={!isFieldsTouched() || loading || this.hasErrors(getFieldsError())}
                    loading={loading}
                    onClick={() => {
                      validateFields((err, values) => {
                        if (!err) {
                          const fieldValues = {
                            firstName: getFieldValue('firstName'),
                            lastName: getFieldValue('lastName'),
                            jobTitle: getFieldValue('jobTitle'),
                            entity: {
                              __typename: 'Entity',
                              entityName: getFieldValue('entityName'),
                              VATIN: getFieldValue('VATIN'),
                              statisticalNumber: getFieldValue('statisticalNumber'),
                              courtRegisterNumber: getFieldValue('courtRegisterNumber'),
                              street: getFieldValue('street'),
                              postalCode: getFieldValue('postalCode'),
                              city: getFieldValue('city'),
                              country: getFieldValue('country'),
                            },
                            agreedToMarketingCommunication: getFieldValue(
                              'agreedToMarketingCommunication'
                            ),
                            agreedToPersonalDataProcessing: getFieldValue(
                              'agreedToPersonalDataProcessing'
                            ),
                          };
                          mutate({
                            variables: {
                              data: fieldValues,
                            },
                            update: store => {
                              const data = store.readQuery({ query: meUserQuery });
                              data.meUser = { ...data.meUser, ...fieldValues };
                              store.writeQuery({ query: meUserQuery, data });
                            },
                          });
                        }
                      });
                    }}
                  >
                    {intl.get('Save')}
                  </Button>
                </Form.Item>
              </div>
              {error && <div className="text-red">{error.message}</div>}
            </Fragment>
          )}
        </Mutation>
      </Form>
    );
  }
}

const WrappedUserForm = Form.create({})(UserForm);

const UserPage = props => (
  <Query query={meUserQuery}>
    {({ loading, error, data }) => {
      if (loading)
        return (
          <div className="fixed pin flex-row justify-center items-center">
            <Spin size="large" />
          </div>
        );
      if (error) return `Error! ${error.message}`;

      return <WrappedUserForm user={data.meUser} />;
    }}
  </Query>
);

export default UserPage;
