import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { C, DISPLAY } from "./theme";
export function Vinyl() {
  const [turn] = useState(() => new Animated.Value(0));
  const [spinning, setSpinning] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [sideB, setSide] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (!spinning || reduced) return;
    const animation = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [turn, spinning, reduced]);
  return (
    <View style={s.stage}>
      <Text style={s.caption}>FROM THE CITY. FOR THE CULTURE.</Text>
      <View style={s.orbit} />
      <View style={[s.orbit, { width: 330, height: 330, top: 0 }]} />
      <Animated.View
        style={[
          s.record,
          {
            transform: [
              {
                rotate: turn.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-15deg", "345deg"],
                }),
              },
            ],
          },
        ]}
      >
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <View
            key={n}
            style={[
              s.groove,
              { width: 234 - n * 17, height: 234 - n * 17, borderRadius: 150 },
            ]}
          />
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Flip record to side ${sideB ? "A" : "B"}`}
          onPress={() => setSide(!sideB)}
          style={[s.label, { backgroundColor: sideB ? C.green : C.acid }]}
        >
          <Text style={s.labelTitle}>
            {sideB ? "CARIBBEAN\nSOUL" : "HIGH LIFE\nRADIO"}
          </Text>
          <Text style={s.side}>
            SIDE {sideB ? "B · ONE CULTURE" : "A · NYC ↗ JA"}
          </Text>
          <View style={s.hole} />
        </Pressable>
      </Animated.View>
      <View style={s.sticker}>
        <Text style={s.stickerText}>
          TURN IT{`\n`}ALL THE{`\n`}WAY UP ↗
        </Text>
      </View>
      <View style={s.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            spinning ? "Pause record animation" : "Start record animation"
          }
          onPress={() => setSpinning(!spinning)}
          style={s.control}
        >
          <Text style={s.controlText}>
            {spinning ? "Ⅱ Pause spin" : "▶ Spin record"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Flip record"
          onPress={() => setSide(!sideB)}
          style={s.control}
        >
          <Text style={s.controlText}>↻ Flip record</Text>
        </Pressable>
      </View>
      <Text style={s.index}>01 / WORLDWIDE FREQUENCY</Text>
    </View>
  );
}
const s = StyleSheet.create({
  stage: {
    height: 320,
    backgroundColor: "#102219",
    borderWidth: 1,
    borderColor: "#36533e",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 24,
  },
  caption: {
    position: "absolute",
    left: 18,
    top: 18,
    color: C.acid,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  orbit: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "#75683a",
    top: 20,
  },
  record: {
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: "#080b09",
    borderWidth: 2,
    borderColor: "#677357",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 46,
  },
  groove: { position: "absolute", borderWidth: 1, borderColor: "#29372d" },
  label: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#b98e38",
  },
  labelTitle: {
    fontFamily: DISPLAY,
    fontSize: 24,
    lineHeight: 23,
    textAlign: "center",
    color: C.ink,
  },
  side: { fontSize: 6, fontWeight: "800", marginTop: 7, color: C.ink },
  hole: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.ink,
    marginTop: 6,
  },
  sticker: {
    position: "absolute",
    right: 8,
    bottom: 46,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.red,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "12deg" }],
  },
  stickerText: {
    fontFamily: DISPLAY,
    fontSize: 21,
    lineHeight: 20,
    color: C.paper,
  },
  controls: { position: "absolute", right: 12, top: 40, gap: 5 },
  control: {
    backgroundColor: "#090f0de8",
    borderWidth: 1,
    borderColor: "#63715d",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 9,
    minHeight: 36,
  },
  controlText: { color: C.paper, fontSize: 9, fontWeight: "700" },
  index: {
    position: "absolute",
    left: 18,
    bottom: 12,
    color: C.muted,
    fontSize: 8,
    letterSpacing: 1.2,
  },
});
