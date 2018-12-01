// @flow
import * as React from 'react';
import {
  View, StyleSheet, Dimensions, Text,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import Header from './Header';

export const SMALL_HEADER_SIZE = 45 + 64;
export const MEDIUM_HEADER_SIZE = 300;
const {
  Extrapolate, event, Value, interpolate, floor, divide, multiply, add, sub, mutiply,
} = Animated;
const { width, height: wHeight } = Dimensions.get('window');

type HeadersProps = {
  sections: Section[],
  y: Value,
  currentIndex: Value,
};

export default class Headers extends React.PureComponent<HeadersProps> {
  render() {
    const {
      sections, y, currentIndex,
    } = this.props;
    const sectionHeight = wHeight / sections.length;
    const height = interpolate(
      y,
      {
        inputRange: [-wHeight + SMALL_HEADER_SIZE, -wHeight + MEDIUM_HEADER_SIZE, 0],
        outputRange: [SMALL_HEADER_SIZE, MEDIUM_HEADER_SIZE, sectionHeight],
        extrapolate: Extrapolate.CLAMP,
      },
    );
    const containerHeight = interpolate(y, {
      inputRange: [-wHeight + SMALL_HEADER_SIZE, 0],
      outputRange: [SMALL_HEADER_SIZE, wHeight],
      extrapolate: Extrapolate.CLAMP,
    });
    return (
      <Animated.View style={[styles.container, { width: width * sections.length, height: containerHeight }]}>
        {
          sections.map((section, key) => {
            const translateX = interpolate(y, {
              inputRange: [-wHeight + MEDIUM_HEADER_SIZE, 0],
              outputRange: [key * width, multiply(width, currentIndex)],
              extrapolate: Extrapolate.CLAMP,
            });
            const translateY = interpolate(y, {
              inputRange: [-wHeight + SMALL_HEADER_SIZE, -wHeight + MEDIUM_HEADER_SIZE, 0],
              outputRange: [-key * SMALL_HEADER_SIZE, -key * MEDIUM_HEADER_SIZE, 0],
              extrapolate: Extrapolate.CLAMP,
            });
            return (
              <Animated.View
                key={section.title}
                style={{
                  width,
                  height,
                  transform: [{ translateY, translateX }],
                }}
              >
                <Header
                  numberOfHeaders={sections.length}
                  {...{ key, section }}
                />
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{section.title.toUpperCase()}</Text>
                </View>
                <View style={styles.labelContainer}>
                  <View style={styles.cursor} />
                </View>
              </Animated.View>
            );
          })
        }
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#343761',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 32,
  },
  cursor: {
    width: 50,
    height: 4,
    backgroundColor: 'white',
    top: 32,
  },
});