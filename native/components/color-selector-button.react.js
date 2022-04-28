// @flow

import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const outerRingStyle = React.useMemo(() => {
    if (isSelected) {
      return [styles.outerRing, { backgroundColor: '#404040' }];
    }
    return styles.outerRing;
  }, [isSelected]);

  return (
    <View style={outerRingStyle}>
      <TouchableOpacity style={colorSplotchStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    height: 40,
    margin: 10,
    width: 40,
  },
  outerRing: {
    borderRadius: 40,
    height: 60,
    margin: 5,
    width: 60,
  },
});

export default ColorSelectorButton;
