import React, { Component } from 'react';
import intl from 'react-intl-universal';

import { Menu, Dropdown, Icon } from 'antd';

export default class LanguageSelect extends Component {
  render() {
    const { currentLocale, setLocale } = this.props;

    return (
      <div className="absolute pin-x pin-t container flex-row justify-end mt-3">
        <div className="cursor-pointer">
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu onClick={e => setLocale(e.key)}>
                <Menu.Item key="pl-PL">Poland - Polski</Menu.Item>
                <Menu.Item key="en-GB">United Kingdom - English</Menu.Item>
              </Menu>
            }
          >
            <span>
              {intl.get(currentLocale)} <Icon type="down" />
            </span>
          </Dropdown>
        </div>
      </div>
    );
  }
}
