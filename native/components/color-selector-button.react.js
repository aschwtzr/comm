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

  const isSelected = tinycolor.equals(currentColor, color);

  const selectedButtonStyle = React.useMemo(() => {
    if (isSelected) {
      return {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: `#${color}`,
        shadowOpacity: 1,
        shadowRadius: 20,
      };
    }
  }, [color, isSelected]);

  const colorSplotchStyle = React.useMemo(() => {
    return [
      styles.button,
      { backgroundColor: `#${color}` },
      selectedButtonStyle,
    ];
  }, [color, selectedButtonStyle]);

  const selectedButtonContent = React.useMemo(() => {
    if (isSelected) {
      return <Icon name="ios-checkmark" size={36} color="white" />;
    }
  }, [isSelected]);

  return (
    <TouchableOpacity style={colorSplotchStyle}>
      {selectedButtonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    height: 40,
    margin: 15,
    width: 40,
  },
});

export default ColorSelectorButton;
