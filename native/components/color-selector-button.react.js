// @flow

import * as React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tinycolor from 'tinycolor2';

type ColorSelectorButtonProps = {
  +color: string,
  +currentColor: string,
};

function ColorSelectorButton(props: ColorSelectorButtonProps): React.Node {
  const { color, currentColor } = props;

  const colorSplotchStyle = React.useMemo(() => {
    return [styles.button, { backgroundColor: `#${color}` }];
  }, [color]);

  const isSelected = tinycolor.equals(currentColor, color);
  const selectedButtonIndicator = React.useMemo(() => {
    if (isSelected) {
      return <Icon name="ios-checkmark" size={36} color="white" />;
    }
  }, [isSelected]);

  return (
    <TouchableOpacity style={colorSplotchStyle}>
      {selectedButtonIndicator}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    margin: 15,
    width: 40,
  },
});

export default ColorSelectorButton;
