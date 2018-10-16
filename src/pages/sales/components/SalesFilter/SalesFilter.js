import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from 'reactstrap';

import s from './SalesFilter.scss';

class SalesFilter extends Component {
  static propTypes = {
    defaultLable: PropTypes.string.isRequired,
    options: PropTypes.any.isRequired,
  };

  state = {
    currentOption: this.props.options[0],
  };

  changeOption(currentOption) {
    this.setState({ currentOption });
  }

  render() {
    const { options, defaultLable } = this.props;
    const { currentOption } = this.state;
    return (
      <div className={s.filterElement}>
        <div className={s.filterElementLable}>{defaultLable}</div>
        <UncontrolledButtonDropdown>
          <DropdownToggle
            caret
            color="default"
            className="dropdown-toggle-split mr-xs"
          >
            {currentOption}
          </DropdownToggle>
          <DropdownMenu>
            {options.map(item => (
              <DropdownItem key={item} onClick={() => this.changeOption(item)}>
                {item}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    );
  }
}

export default withStyles(s)(SalesFilter);