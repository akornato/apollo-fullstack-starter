import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { withRouter, Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { gql } from 'apollo-boost';

import { Form, Icon, Input, Button } from 'antd';

const loginMutation = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

class LoginPage extends Component {
  state = {
    email: '',
    password: '',
    error: null,
    submitting: false,
  };

  render() {
    const { email, password, error, submitting } = this.state;

    return (
      <div className="fixed w-full h-full pin flex-row items-center justify-center">
        <div className="w-64 p-5 bg-white shadow rounded">
          <Form onSubmit={this.login}>
            <Form.Item>
              <Input
                autoFocus
                prefix={<Icon type="user" />}
                placeholder="Email"
                type="email"
                onChange={e => this.setState({ email: e.target.value })}
                value={email}
                required
              />
            </Form.Item>
            <Form.Item>
              <Input
                prefix={<Icon type="lock" />}
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
                {intl.get('Login')}
              </Button>
            </Form.Item>
          </Form>
          <div className="mt-3 text-red">{error}</div>

          <div className="mt-3 flex-row justify-between text-small">
            <Link to="/signup">{intl.get('Signup')}</Link>
            <Link to="/pass-reset">{intl.get('Reset password')}</Link>
          </div>
        </div>
      </div>
    );
  }

  login = async e => {
    e.preventDefault();

    this.setState({ error: null, submitting: true });

    const { email, password } = this.state;
    try {
      const result = await this.props.loginMutation({
        variables: {
          email,
          password,
        },
      });

      const token = result.data.login.token;

      this.props.refreshToken(token);

      this.props.history.replace('/dpo');
    } catch (err) {
      this.setState({ error: err.message, submitting: false });
    }
  };
}

export default graphql(loginMutation, { name: 'loginMutation' })(withRouter(LoginPage));
