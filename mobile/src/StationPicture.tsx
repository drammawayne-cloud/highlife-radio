import { useRef, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { VideoView } from "expo-video";
import { useRadioContext } from "./RadioContext";
import { rotation } from "./rotation";
export function StationPicture() {
  const { audio, clock } = useRadioContext();
  const [expanded, setExpanded] = useState(false),
    tap = useRef(0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(clock));
  const now =
    Number(parts.find((p) => p.type === "hour")?.value) * 60 +
    Number(parts.find((p) => p.type === "minute")?.value);
  const minute = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const block = rotation.find((b) => {
    const s = minute(b.start),
      e = minute(b.end);
    return e > s ? now >= s && now < e : now >= s || now < e;
  });
  const toggle = () => {
    const stamp = Date.now();
    if (stamp - tap.current < 350) {
      setExpanded((v) => !v);
      tap.current = 0;
    } else tap.current = stamp;
  };
  const picture = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        expanded ? "Return from full screen" : "Expand station picture"
      }
      onPress={toggle}
      onAccessibilityTap={() => setExpanded((v) => !v)}
      style={expanded ? s.full : s.screen}
    >
      <VideoView
        pointerEvents="none"
        surfaceType="textureView"
        player={audio.player}
        nativeControls={false}
        contentFit="contain"
        style={StyleSheet.absoluteFill}
      />
      {(!audio.playing || !audio.picture) && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.cover]}>
          <Image
            source={require("../assets/website/radio-logo.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.rotation}>{block?.name || "NYC High Life Radio"}</Text>
          <Text style={s.time}>FROM NEW YORK TO THE WORLD.</Text>
        </View>
      )}
    </Pressable>
  );
  return (
    <>
      <View style={s.screen}>{!expanded && picture()}</View>
      <Modal
        visible={expanded}
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
        statusBarTranslucent
      >
        {expanded && picture()}
      </Modal>
    </>
  );
}
const s = StyleSheet.create({
  screen: {
    aspectRatio: 16 / 9,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#07130d",
    borderWidth: 1,
    borderColor: "#8e7a52",
  },
  full: { flex: 1, backgroundColor: "#000" },
  cover: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07130d",
    gap: 5,
  },
  logo: { width: "45%", height: "58%" },
  rotation: {
    color: "#f5dfae",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  time: { color: "#95bca1", fontSize: 8, letterSpacing: 1.5 },
});
