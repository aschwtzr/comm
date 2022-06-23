// @flow

import * as React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import tinycolor from 'tinycolor2';

import { selectedThreadColors } from 'lib/shared/thread-utils';

import ColorSelectorButton from './color-selector-button.react';

type ColorSelectorProps = {
  +currentColor: string,
  +windowWidth: number,
  +onColorSelected: (hex: string) => void,
};
function ColorSelector(props: ColorSelectorProps): React.Node {
  const { currentColor, onColorSelected } = props;
  const [pendingColor, setPendingColor] = React.useState(currentColor);

  const colorSelectorButtons = React.useMemo(
    () =>
      selectedThreadColors.map(color => (
        <ColorSelectorButton
          key={color}
          color={color}
          pendingColor={pendingColor}
          setPendingColor={setPendingColor}
        />
      )),
    [pendingColor],
  );

  const firstRow = React.useMemo(
    () => colorSelectorButtons.slice(0, colorSelectorButtons.length / 2),
    [colorSelectorButtons],
  );

  const secondRow = React.useMemo(
    () => colorSelectorButtons.slice(colorSelectorButtons.length / 2),
    [colorSelectorButtons],
  );

  const saveButtonDisabled = tinycolor.equals(currentColor, pendingColor);
  const saveButtonStyle = React.useMemo(
    () => [
      styles.saveButton,
      {
        backgroundColor: saveButtonDisabled ? '#404040' : `#${pendingColor}`,
        width: 0.75 * props.windowWidth,
      },
    ],
    [saveButtonDisabled, pendingColor, props.windowWidth],
  );

  const onColorSplotchSaved = React.useCallback(() => {
    onColorSelected(`#${pendingColor}`);
  }, [onColorSelected, pendingColor]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select thread color</Text>
      <View style={styles.colorButtons}>{firstRow}</View>
      <View style={styles.colorButtons}>{secondRow}</View>
      <View style={saveButtonStyle}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onColorSplotchSaved}
          disabled={saveButtonDisabled}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  colorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  container: {
    alignItems: 'center',
    flex: 1,
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 5,
    margin: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ColorSelector;
