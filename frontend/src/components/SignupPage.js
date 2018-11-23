import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { withRouter, Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { gql } from 'apollo-boost';

import { Form, Input, Button } from 'antd';

const signupMutation = gql`
  mutation($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
    signup(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
      token
    }
  }
`;

class SignupPage extends Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    error: null,
    submitting: false,
  };

  render() {
    const { email, password, firstName, lastName, error, submitting } = this.state;

    return (
      <div className="fixed w-full h-full pin flex-row items-center justify-center">
        <div className="w-64 p-5 bg-white shadow rounded">
          <Form onSubmit={this.signup}>
            <Form.Item>
              <Input
                autoFocus
                placeholder={intl.get('firstName')}
                type="text"
                onChange={e => this.setState({ firstName: e.target.value })}
                value={firstName}
                required
              />
            </Form.Item>
            <Form.Item>
              <Input
                autoFocus
                placeholder={intl.get('lastName')}
                type="text"
                onChange={e => this.setState({ lastName: e.target.value })}
                value={lastName}
                required
              />
            </Form.Item>
            <Form.Item>
              <Input
                placeholder="Email"
                type="email"
                onChange={e => this.setState({ email: e.target.value })}
                value={email}
                required
              />
            </Form.Item>
            <Form.Item>
              <Input
                placeholder={intl.get('Password')}
                type="password"
                onChange={e => this.setState({ password: e.target.value })}
                value={password}
                required
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                className="w-full"
                htmlType="submit"
                disabled={submitting}
                loading={submitting}
              >
                {intl.get('Signup')}
              </Button>
            </Form.Item>
            <div className="mt-3 text-red">{error}</div>

            <div className="mt-3 text-small">
              <Link to="/login">{intl.get('Login')}</Link>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  signup = async e => {
    e.preventDefault();

    this.setState({ error: null, submitting: true });

    const { firstName, lastName, email, password } = this.state;
    try {
      const result = await this.props.signupMutation({
        variables: {
          firstName,
          lastName,
          email,
          password,
        },
      });

      const token = result.data.signup.token;

      this.props.refreshToken(token);

      this.props.history.replace('/dpo');
    } catch (err) {
      this.setState({ error: err.message, submitting: false });
    }
  };
}

export default graphql(signupMutation, { name: 'signupMutation' })(withRouter(SignupPage));
