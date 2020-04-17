import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  Value,
  and,
  block,
  cond,
  debug,
  diff,
  eq,
  multiply,
  not,
  proc,
  set,
  useCode,
} from "react-native-reanimated";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { onGestureEvent, translate, vec } from "react-native-redash";

const { width, height } = Dimensions.get("window");
const CANVAS = vec.create(width, height);
const CENTER = vec.divide(CANVAS, 2);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: "cover",
  },
});
// See: https://github.com/kmagiera/react-native-gesture-handler/issues/553
export const pinchBegan = proc((state: Animated.Node<State>) =>
  Platform.OS === "ios"
    ? eq(state, State.BEGAN)
    : eq(diff(state), State.ACTIVE - State.BEGAN)
);

export const pinchActive = proc(
  (state: Animated.Node<State>, numberOfPointers: Animated.Node<number>) =>
    Platform.OS === "ios"
      ? and(eq(state, State.ACTIVE), eq(numberOfPointers, 2))
      : and(
          eq(state, State.ACTIVE),
          not(pinchBegan(state)),
          eq(numberOfPointers, 2)
        )
);

export default () => {
  const origin = vec.createValue(0, 0);
  const pinch = vec.createValue(0, 0);
  const focal = vec.createValue(0, 0);
  const scale = new Value(1);
  const scaleOffset = new Value(1);
  const offset = vec.createValue(0, 0);
  const state = new Value(State.UNDETERMINED);
  const numberOfPointers = new Value(0);
  const pinchGestureHandler = onGestureEvent({
    numberOfPointers,
    scale,
    state,
    focalX: focal.x,
    focalY: focal.y,
  });
  const adjustedFocal = vec.sub(focal, vec.add(CENTER, offset));
  const translation = vec.createValue(0, 0);
  useCode(
    () =>
      block([
        cond(pinchBegan(state), [
          debug("originX", origin.x),
          debug("originY", origin.y),
          vec.set(origin, adjustedFocal),
        ]),
        cond(pinchActive(state, numberOfPointers), [
          vec.set(pinch, vec.sub(adjustedFocal, origin)),
          vec.set(
            translation,
            vec.add(pinch, origin, vec.multiply(-1, scale, origin))
          ),
        ]),
        cond(eq(state, State.END), [
          vec.set(offset, vec.add(offset, translation)),
          set(scaleOffset, multiply(scale, scaleOffset)),
          set(scale, 1),
          vec.set(translation, 0),
          vec.set(focal, 0),
          set(scale, 1),
          vec.set(pinch, 0),
        ]),
      ]),
    [
      adjustedFocal,
      focal,
      numberOfPointers,
      offset,
      origin,
      pinch,
      scale,
      scaleOffset,
      state,
      translation,
    ]
  );
  return (
    <View style={styles.container}>
      <PinchGestureHandler {...pinchGestureHandler}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Animated.Image
            style={[
              styles.image,
              {
                transform: [
                  ...translate(vec.add(offset, translation)),
                  { scale: multiply(scaleOffset, scale) },
                ],
              },
            ]}
            source={require("./assets/zurich.jpg")}
          />
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};