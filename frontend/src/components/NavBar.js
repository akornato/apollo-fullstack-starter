import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Menu, Button, Spin, Icon, Tooltip } from 'antd';

import logo from '../assets/logo-full.svg';

const query = gql`
  query {
    meUser {
      firstName
      lastName
    }
  }
`;

class NavBar extends Component {
  componentDidUpdate(prevProps, prevState) {
    if (this.props.token !== prevProps.token) {
      this.props.query.refetch();
    }
  }

  render() {
    const {
      pathname,
      refreshToken,
      query: { error, loading, meUser },
    } = this.props;

    return (
      <div className="flex-row items-center pt-10">
        <img src={logo} className="w-48 mr-5" alt="logo" />
        <Menu mode="horizontal" selectedKeys={[pathname]}>
          <Menu.Item key="/clients">
            <Link to="/clients">
              <Icon type="global" />
              {intl.get('Clients')}
            </Link>
          </Menu.Item>
        </Menu>
        <div className="mx-auto" />
        <Menu mode="horizontal" selectedKeys={[pathname]}>
          {error ? (
            error.message
          ) : loading ? (
            <Menu.Item key="/dpo">
              <Link to="/dpo">
                <Icon type="user" />
                <Spin />
              </Link>
            </Menu.Item>
          ) : (
            <Menu.Item key="/dpo">
              <Link to="/dpo">
                <Icon type="user" />
                {meUser.firstName}
              </Link>
            </Menu.Item>
          )}
        </Menu>

        <Tooltip placement="bottom" title={intl.get('Logout')}>
          <Button
            className="ml-3"
            shape="circle"
            icon="logout"
            onClick={() => refreshToken(null)}
          />
        </Tooltip>
      </div>
    );
  }
}

export default graphql(query, {
  name: 'query',
  options: {
    errorPolicy: 'all',
  },
})(NavBar);
