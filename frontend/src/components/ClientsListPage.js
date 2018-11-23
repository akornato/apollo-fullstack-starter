import React, { Component } from 'react';
import { withRouter } from 'react-router';
import intl from 'react-intl-universal';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

import { Form, Table, Modal, Input, Button, Spin } from 'antd';

const myClientListQuery = gql`
  query {
    myClientList {
      id
      entity {
        entityName
      }
    }
  }
`;

const addMyClientMutation = gql`
  mutation($entityName: String!) {
    addMyClient(entityName: $entityName) {
      id
    }
  }
`;

const deleteMyClientMutation = gql`
  mutation($id: String!) {
    deleteMyClient(id: $id) {
      id
    }
  }
`;

class AddMyClientForm extends Component {
  render() {
    const {
      addMyClientModalVisible,
      hideAddMyClientModal,
      form: { getFieldDecorator, getFieldValue, getFieldError, isFieldTouched },
    } = this.props;

    return (
      <Form>
        <Mutation mutation={addMyClientMutation} onCompleted={hideAddMyClientModal}>
          {(mutate, { error, loading }) => (
            <Modal
              title={intl.get('Add client')}
              visible={addMyClientModalVisible}
              onOk={() => {
                const entityName = getFieldValue('entityName');
                mutate({
                  variables: { entityName },
                  update: (store, { data: { addMyClient } }) => {
                    const data = store.readQuery({
                      query: myClientListQuery,
                    });
                    data.myClientList.push({
                      id: addMyClient.id,
                      entity: {
                        entityName,
                        __typename: 'Entity',
                      },
                      __typename: 'Client',
                    });
                    store.writeQuery({ query: myClientListQuery, data });
                  },
                });
              }}
              okButtonProps={{
                disabled: !isFieldTouched('entityName') || getFieldError('entityName'),
              }}
              okText={intl.get('Add')}
              confirmLoading={loading}
              onCancel={hideAddMyClientModal}
              cancelText={intl.get('Cancel')}
            >
              <Form.Item
                label={intl.get('entityName')}
                validateStatus={
                  isFieldTouched('entityName') && getFieldError('entityName') ? 'error' : ''
                }
                help={(isFieldTouched('entityName') && getFieldError('entityName')) || ''}
              >
                {getFieldDecorator('entityName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('This field is required'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>

              {error && <div className="text-red">{error.message}</div>}
            </Modal>
          )}
        </Mutation>
      </Form>
    );
  }
}

const WrappedAddMyClientForm = Form.create({})(AddMyClientForm);

class ClientsListPage extends Component {
  state = { addMyClientModalVisible: false, deleteMyClientModalVisible: false };
  showAddMyClientModal = () => this.setState({ addMyClientModalVisible: true });
  hideAddMyClientModal = () => this.setState({ addMyClientModalVisible: false });
  showDeleteMyClientModal = client =>
    this.setState({
      deleteMyClientModalVisible: true,
      deleteMyClientId: client.id,
      deleteMyClientName: client.entityName,
    });
  hideDeleteMyClientModal = () => this.setState({ deleteMyClientModalVisible: false });
  render() {
    const { history } = this.props;
    return (
      <Query query={myClientListQuery}>
        {({ loading, error, data }) => {
          if (loading)
            return (
              <div className="fixed pin flex-row justify-center items-center">
                <Spin size="large" />
              </div>
            );
          if (error) return `Error! ${error.message}`;

          const {
            addMyClientModalVisible,
            deleteMyClientModalVisible,
            deleteMyClientId,
            deleteMyClientName,
          } = this.state;

          return (
            <div className="pt-16">
              <Table
                dataSource={data.myClientList}
                locale={{
                  emptyText: intl.get('No clients'),
                }}
                columns={[
                  {
                    dataIndex: 'entity.entityName',
                  },
                  {
                    key: 'delete',
                    width: 1,
                    render: (text, record) => (
                      <Button
                        shape="circle"
                        icon="delete"
                        onClick={e => {
                          e.stopPropagation();
                          this.showDeleteMyClientModal(record);
                        }}
                      />
                    ),
                  },
                ]}
                rowKey="id"
                rowClassName="cursor-pointer"
                footer={() => (
                  <Button onClick={this.showAddMyClientModal}>{intl.get('Add client')}</Button>
                )}
                onRow={record => ({
                  onClick: () => history.push('/client/' + record.id),
                })}
              />

              <WrappedAddMyClientForm
                addMyClientModalVisible={addMyClientModalVisible}
                hideAddMyClientModal={this.hideAddMyClientModal}
              />

              <Mutation
                mutation={deleteMyClientMutation}
                onCompleted={this.hideDeleteMyClientModal}
              >
                {(mutate, { error, loading }) => (
                  <Modal
                    title={intl.get('Delete client')}
                    visible={deleteMyClientModalVisible}
                    onOk={() => {
                      mutate({
                        variables: { id: deleteMyClientId },
                        update: (store, { data: { deleteMyClient } }) => {
                          const data = store.readQuery({
                            query: myClientListQuery,
                          });
                          data.myClientList = data.myClientList.filter(
                            client => client.id !== deleteMyClient.id
                          );
                          store.writeQuery({ query: myClientListQuery, data });
                        },
                      });
                    }}
                    okText={intl.get('Yes')}
                    confirmLoading={loading}
                    onCancel={this.hideDeleteMyClientModal}
                    cancelText={intl.get('Cancel')}
                  >
                    <div>
                      {intl.get('Are you sure you want to delete') + ' ' + deleteMyClientName + '?'}
                    </div>
                    <div className="mt-3 text-red">
                      {intl.get('All client data will be deleted!')}
                    </div>

                    {error && <div className="text-red">{error.message}</div>}
                  </Modal>
                )}
              </Mutation>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default withRouter(ClientsListPage);
