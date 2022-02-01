// @flow

import classnames from 'classnames';
import * as React from 'react';

import css from './button.css';

type Props = {
  +onClick: ?Function,
  +children: React.Node,
  +variant?: 'primary' | 'secondary' | 'danger' | 'round',
  +type?: string,
  +disabled?: boolean,
};

function Button(props: Props): React.Node {
  const { onClick, children, variant, type, disabled = false } = props;
  const btnCls = classnames(css.btn, {
    [css.round]: variant === 'round',
    [css.primary]: variant === 'primary',
    [css.secondary]: variant === 'secondary',
    [css.danger]: variant === 'danger',
  });

  return (
    <button
      type={type}
      className={btnCls}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
