import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { withRouter, Link } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import { gql } from 'apollo-boost';

import { Form, Input, Button } from 'antd';

const requestCodeMutation = gql`
  mutation($email: String!, $from: String!, $subject: String!) {
    requestCode(email: $email, from: $from, subject: $subject) {
      email
    }
  }
`;

const setPasswordMutation = gql`
  mutation($email: String!, $code: String!, $password: String!) {
    setPassword(email: $email, code: $code, password: $password) {
      token
    }
  }
`;

class PassResetPage extends Component {
  state = {
    email: '',
    code: '',
    password: '',
    notification: null,
    error: null,
    submitting: false,
  };

  render() {
    const { email, code, password, notification, error, submitting } = this.state;

    return (
      <div className="fixed w-full h-full pin flex-row items-center justify-center">
        <div className="w-64 p-5 bg-white shadow rounded">
          <Form onSubmit={this.requestCode} autoComplete="off">
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
              <Button
                type="primary"
                className="w-full"
                htmlType="submit"
                disabled={submitting}
                loading={submitting}
              >
                {intl.get('Send code')}
              </Button>
            </Form.Item>
          </Form>
          <Form onSubmit={this.setPassword} autoComplete="off">
            <Form.Item>
              <Input
                name="verification-code"
                placeholder={intl.get('Verification code')}
                type="text"
                onChange={e => this.setState({ code: e.target.value })}
                value={code}
                required
              />
            </Form.Item>
            <Form.Item>
              <Input
                placeholder={intl.get('New password')}
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
                {intl.get('Set password')}
              </Button>
            </Form.Item>

            {error ? (
              <div className="mt-3 text-red">{error}</div>
            ) : (
              notification && <div className="mt-3 text-green">{notification}</div>
            )}

            <div className="mt-3 text-small">
              <Link to="/login">{intl.get('Login')}</Link>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  requestCode = async e => {
    e.preventDefault();

    this.setState({ error: null, notification: null, submitting: true });

    const { email } = this.state;
    try {
      const result = await this.props.requestCodeMutation({
        variables: {
          email,
          from: 'no-reply@domain-name.com',
          subject: intl.get('Verification code'),
        },
      });

      this.setState({
        notification: intl.get('Verification code sent to') + ' ' + result.data.requestCode.email,
        submitting: false,
      });
    } catch (err) {
      this.setState({ error: err.message, submitting: false });
    }
  };

  setPassword = async e => {
    e.preventDefault();

    this.setState({ error: null, notification: null, submitting: true });

    const { email, code, password } = this.state;
    try {
      const result = await this.props.setPasswordMutation({
        variables: {
          email,
          code,
          password,
        },
      });

      const token = result.data.setPassword.token;

      this.props.refreshToken(token);

      this.props.history.replace('/dpo');
    } catch (err) {
      this.setState({ error: err.message, submitting: false });
    }
  };
}

export default compose(
  graphql(requestCodeMutation, { name: 'requestCodeMutation' }),
  graphql(setPasswordMutation, { name: 'setPasswordMutation' })
)(withRouter(PassResetPage));
