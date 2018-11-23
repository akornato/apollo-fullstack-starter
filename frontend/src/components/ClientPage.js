import React, { Fragment, Component } from 'react';
import intl from 'react-intl-universal';
import gql from 'graphql-tag';
import SimpleStorage from 'react-simple-storage';

import { Menu, Spin } from 'antd';

import { Query } from 'react-apollo';

import ClientEntityData from './clientPage/ClientEntityData';
import ClientAdditionalData from './clientPage/ClientAdditionalData';

export const myClientQuery = gql`
  query($id: String!) {
    myClient(id: $id) {
      id

      owner

      entity {
        entityName
        VATIN
        statisticalNumber
        courtRegisterNumber
        street
        postalCode
        city
        country
        www
        email
      }

      entityType
      entitySubtype
      employeeCount
      contractorCount
    }
  }
`;

export default class Client extends Component {
  state = {
    page: 'entityData',
  };
  render() {
    const {
      match: {
        params: { id: clientId },
      },
    } = this.props;
    const { page } = this.state;
    return (
      <Fragment>
        <SimpleStorage parent={this} prefix={'ClientPage'} />

        <Query query={myClientQuery} variables={{ id: clientId }}>
          {({ loading, error, data }) => {
            if (loading)
              return (
                <div className="fixed pin flex-row justify-center items-center">
                  <Spin size="large" />
                </div>
              );
            if (error) return `Error! ${error.message}`;

            const client = data.myClient;

            return (
              <Fragment>
                <div className="flex-col items-center pt-5 pb-10">
                  <div className="pb-5">
                    <b>{client.entity.entityName}</b>
                  </div>
                  <Menu
                    mode="horizontal"
                    onClick={e => this.setState({ page: e.key })}
                    selectedKeys={[page]}
                  >
                    <Menu.Item key="entityData">{intl.get('entityData')}</Menu.Item>
                    <Menu.Item key="additionalData">{intl.get('additionalData')}</Menu.Item>
                  </Menu>
                </div>
                {(() => {
                  switch (page) {
                    case 'entityData':
                      return <ClientEntityData client={client} />;
                    case 'additionalData':
                      return <ClientAdditionalData client={client} />;
                    default:
                      return null;
                  }
                })()}
              </Fragment>
            );
          }}
        </Query>
      </Fragment>
    );
  }
}
