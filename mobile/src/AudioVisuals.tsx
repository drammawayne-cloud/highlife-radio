import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRadioContext } from "./RadioContext";
import { STILL } from "./audioMotion";
function useMotion() {
  const { audio } = useRadioContext();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => listener.remove();
  }, []);
  const sample = useSyncExternalStore(
    audio.motion.subscribe,
    audio.motion.getSnapshot,
    () => STILL,
  );
  return { sample, active: audio.playing && !audio.busy && !reduced };
}
export function AudioWaveform() {
  const { sample, active } = useMotion();
  const hasSamples = active && sample.sampledAt > 0;
  return (
    <View
      style={s.wavePanel}
      accessibilityRole="image"
      accessibilityLabel={
        hasSamples
          ? "Waveform of the live radio audio"
          : "Audio waveform at rest"
      }
      testID="radio-waveform"
    >
      <View style={s.midline} />
      <View
        style={s.bars}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {sample.bars.map((value, i) => (
          <View
            key={i}
            testID={`wave-bar-${i}`}
            style={[
              s.bar,
              {
                height: hasSamples ? Math.max(3, value * 78) : 3,
                opacity: hasSamples ? 0.5 + value * 0.5 : 0.45,
                backgroundColor: i % 4 === 0 ? "#d6eaa0" : "#63d68d",
              },
            ]}
          />
        ))}
      </View>
      <Text style={s.caption}>
        {hasSamples ? "LIVE AUDIO" : "HIGH LIFE FREQUENCY"}
      </Text>
    </View>
  );
}
export function NightVisionDancers({ compact = false }: { compact?: boolean }) {
  const { sample, active } = useMotion();
  const { width: screenWidth } = useWindowDimensions();
  const width = compact
    ? screenWidth > 500
      ? 108
      : 76
    : Math.min(240, Math.max(116, (Math.min(screenWidth, 620) - 120) * 0.48));
  const height = width / 2;
  const frame =
    active && sample.energy > 0.008 ? Math.floor(sample.timestamp * 8) % 16 : 0;
  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
        borderRadius: 8,
        backgroundColor: "#07170e",
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={compact ? "player-dancers" : "radio-dancers"}
    >
      <Image
        source={require("../assets/website/night-vision-nyc-crowd.png")}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: width * 4,
          height: height * 4,
          left: -(frame % 4) * width,
          top: -Math.floor(frame / 4) * height,
        }}
      />
    </View>
  );
}
const s = StyleSheet.create({
  wavePanel: {
    flex: 1,
    height: 114,
    backgroundColor: "#08180f",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#806344",
    paddingHorizontal: 10,
    justifyContent: "center",
    overflow: "hidden",
  },
  midline: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 49,
    height: 1,
    backgroundColor: "#305b3d",
  },
  bars: {
    height: 88,
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    justifyContent: "space-between",
  },
  bar: { flex: 1, maxWidth: 7, borderRadius: 2, minWidth: 1 },
  caption: {
    color: "#7ba38a",
    fontSize: 6,
    letterSpacing: 1.1,
    textAlign: "center",
    marginBottom: 5,
  },
});
