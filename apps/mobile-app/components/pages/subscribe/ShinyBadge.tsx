import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ShinyBadge({
  text = "Best Value",
  badgeColor = "#FFB300",
  textColor = "#ffffff",
  shineWidth = 120, // width of the rotating strip (tweak)
  duration = 2000, // duration for one pass (ms)
  angle = 25, // degrees rotation for diagonal shimmer
}) {
  // shared value: will animate from -shineWidth to badge width + shineWidth
  const translateX = useSharedValue(-shineWidth - 10);

  useEffect(() => {
    // loop animation left -> right, then reset and repeat
    translateX.value = withRepeat(
      withTiming(SCREEN_W + shineWidth, { duration }), // large travel so it fully crosses
      -1,
      false,
    );

    return () => cancelAnimation(translateX);
  }, [duration, shineWidth, translateX]);

  // animated style for the shining strip
  const shineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { rotate: `${angle}deg` }],
    };
  });

  return (
    <View style={[styles.badge]} className="px-4 py-0.5 bg-green-500">
      <Text className="text-white font-semibold text-sm">{text}</Text>

      {/* animated shining overlay */}
      <Animated.View
        style={[styles.shineContainer, shineStyle, { width: shineWidth }]}
      >
        {/* Simulate a gradient using three stacked views */}
        <View style={[styles.shinePart, { flex: 1, opacity: 0.06 }]} />
        <View style={[styles.shinePart, { flex: 1, opacity: 0.26 }]} />
        <View style={[styles.shinePart, { flex: 1, opacity: 0.06 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    overflow: "hidden", // important so shine is clipped
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  text: {
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // This container is absolutely positioned and rotated via animated style
  shineContainer: {
    position: "absolute",
    left: -200, // start far left — actual movement controlled by translateX
    top: -10, // adjust vertical so strip crosses nicely
    height: "140%", // make it tall so rotation covers the badge
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row", // children create faux-gradient horizontally
    // no backgroundColor here, children control the look
  },

  // The "fake gradient" bars (three parts)
  shinePart: {
    backgroundColor: "#ffffff", // white with varying opacity looks like a shine
    // borderRadius to soften edges when rotated
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
});
