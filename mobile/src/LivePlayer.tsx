import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NightVisionDancers } from "./AudioVisuals";
import { useRadioContext } from "./RadioContext";
import { C } from "./theme";
export function LivePlayer() {
  const { station, track, audio } = useRadioContext();
  const active = audio.wanted || audio.playing;
  return (
    <View style={s.box}>
      <Image
        source={require("../assets/website/radio-logo.png")}
        style={{ width: 38, height: 38 }}
        accessibilityLabel="NYC High Life Radio"
      />
      <View style={s.details}>
        <Text style={s.live}>
          {audio.playing && !audio.busy
            ? "● LIVE · NYC HIGH LIFE RADIO"
            : "NYC HIGH LIFE RADIO"}
        </Text>
        <Text numberOfLines={1} style={s.song}>
          {track.fresh ? track.title : station.stationName}
        </Text>
        <Text
          numberOfLines={1}
          accessibilityLiveRegion="polite"
          style={s.artist}
        >
          {audio.message}
        </Text>
      </View>
      <NightVisionDancers compact />
      <Pressable
        disabled={!audio.ready}
        accessibilityRole="button"
        accessibilityLabel={
          active ? "Pause NYC High Life Radio" : "Play NYC High Life Radio"
        }
        onPress={audio.toggle}
        style={({ pressed }) => [s.play, pressed && { opacity: 0.7 }]}
      >
        {audio.busy ? (
          <ActivityIndicator color={C.ink} />
        ) : (
          <Text style={s.icon}>{active ? "Ⅱ" : "▶"}</Text>
        )}
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  box: {
    backgroundColor: "#080e0b",
    borderTopWidth: 2,
    borderTopColor: C.green,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  details: { flex: 1, minWidth: 0 },
  live: { color: C.green, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  song: { color: C.paper, fontSize: 14, fontWeight: "700", marginTop: 5 },
  artist: { fontSize: 10, marginTop: 4, color: C.muted },
  play: {
    width: 46,
    height: 46,
    borderRadius: 24,
    backgroundColor: C.acid,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { color: C.ink, fontSize: 18, fontWeight: "900" },
});
