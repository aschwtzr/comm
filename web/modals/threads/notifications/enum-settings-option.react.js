// @flow

import classnames from 'classnames';
import * as React from 'react';

import Radio from '../../../components/radio.react';
import EnumSettingsOptionInfo from './enum-settings-option-info.react';
import css from './enum-settings-option.css';

type Props = {
  +selected: boolean,
  +onSelect: () => void,
  +icon: React.Node,
  +title: string,
  +statements: $ReadOnlyArray<{
    statement: string,
    isStatementValid: ?boolean,
  }>,
};

function EnumSettingsOption(props: Props): React.Node {
  const { icon, title, statements, selected, onSelect } = props;

  const descriptionItems = React.useMemo(
    () =>
      statements.map(({ statement, isStatementValid }) => (
        <EnumSettingsOptionInfo key={statement} valid={isStatementValid}>
          {statement}
        </EnumSettingsOptionInfo>
      )),
    [statements],
  );

  const optionContainerClasses = React.useMemo(
    () =>
      classnames(css.optionContainer, {
        [css.optionContainerSelected]: selected,
      }),
    [selected],
  );
  return (
    <div className={optionContainerClasses} onClick={onSelect}>
      <div className={css.optionIcon}>{icon}</div>
      <div className={css.optionContent}>
        <div className={css.optionTitle}>{title}</div>
        <div className={css.optionDescription}>{descriptionItems}</div>
      </div>
      <Radio checked={selected} />
    </div>
  );
}

export default EnumSettingsOption;
