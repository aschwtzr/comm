// @flow

import classnames from 'classnames';
import * as React from 'react';

import css from './button.css';

type Props = {
  +onClick: (event: SyntheticEvent<HTMLButtonElement>) => void,
  +children: React.Node,
  +variant?: 'primary' | 'round',
  +type?: string,
  +disabled?: boolean,
};

function Button(props: Props): React.Node {
  const { onClick, children, variant, type, disabled = false } = props;
  const btnCls = classnames(css.btn, {
    [css.round]: variant === 'round',
    [css.primary]: variant === 'primary',
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
