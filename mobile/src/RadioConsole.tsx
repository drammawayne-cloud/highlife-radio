import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StationPicture } from "./StationPicture";
import { AudioWaveform, NightVisionDancers } from "./AudioVisuals";
import { useRadioContext } from "./RadioContext";
import { C, DISPLAY } from "./theme";
export function RadioConsole() {
  const { audio, track, station } = useRadioContext();
  const active = audio.wanted || audio.playing;
  return (
    <View style={s.console}>
      <View style={s.top}>
        <Text style={s.name}>HIGH LIFE RADIO</Text>
        <Text style={s.badge}>
          {audio.playing && !audio.busy ? "● ON AIR" : "LIVE RADIO"}
        </Text>
      </View>
      <StationPicture />
      <View style={s.body}>
        <AudioWaveform />
        <View style={s.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={active ? "Pause live radio" : "Play live radio"}
            accessibilityState={{ disabled: !audio.ready }}
            disabled={!audio.ready}
            onPress={audio.toggle}
            style={({ pressed }) => [s.play, pressed && { opacity: 0.75 }]}
          >
            {audio.busy ? (
              <ActivityIndicator size="large" color={C.ink} />
            ) : (
              <Text style={s.playIcon}>{active ? "Ⅱ" : "▶"}</Text>
            )}
          </Pressable>
          <Text style={s.press}>{active ? "TAP TO PAUSE" : "PRESS PLAY"}</Text>
        </View>
      </View>
      <View
        style={[
          s.display,
          { flexDirection: "row", alignItems: "center", gap: 10 },
        ]}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={2} style={s.track}>
            {track.fresh ? track.title : station.stationName}
          </Text>
          <Text numberOfLines={1} style={s.artist}>
            {track.fresh ? track.artist : "New York energy. Caribbean soul."}
          </Text>
          <Text accessibilityLiveRegion="polite" style={s.status}>
            {audio.message}
          </Text>
        </View>
        <NightVisionDancers />
      </View>
      <View style={s.feet}>
        <View style={s.foot} />
        <Text style={s.label}>
          THE SOUND OF NEW YORK. THE SOUL OF THE CARIBBEAN.
        </Text>
        <View style={s.foot} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  console: {
    marginTop: 18,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#38251a",
    borderWidth: 3,
    borderColor: "#a07747",
    boxShadow: "0px 12px 32px rgba(0,0,0,0.45)",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontFamily: DISPLAY,
    fontSize: 24,
    color: "#f6dfaa",
    letterSpacing: 1.5,
  },
  badge: { fontSize: 9, fontWeight: "800", color: C.green, letterSpacing: 1 },
  dial: {
    backgroundColor: "#0d1b15",
    borderColor: "#927246",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
  },
  scale: { flexDirection: "row", justifyContent: "space-between" },
  tick: { color: "#d6bb78", fontSize: 9 },
  ticks: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 18,
    marginTop: 5,
  },
  frequency: {
    textAlign: "center",
    fontFamily: DISPLAY,
    fontSize: 24,
    color: "#e8d9a9",
    letterSpacing: 2,
  },
  body: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    marginVertical: 20,
  },
  speaker: {
    flex: 1,
    backgroundColor: "#161410",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#806344",
    padding: 12,
    gap: 5,
  },
  grille: { height: 3, backgroundColor: "#67543d", borderRadius: 2 },
  controls: { alignItems: "center", gap: 10 },
  play: {
    width: 94,
    height: 94,
    borderRadius: 50,
    backgroundColor: C.acid,
    borderWidth: 5,
    borderColor: "#d4af58",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { fontSize: 36, color: C.ink, fontWeight: "900" },
  press: {
    color: "#f7dda5",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  display: {
    backgroundColor: "#111810",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#6d7044",
  },
  track: { fontFamily: DISPLAY, fontSize: 25, lineHeight: 27, color: C.paper },
  artist: { color: "#c0bea2", fontSize: 12, marginTop: 5 },
  status: { color: C.green, fontSize: 10, marginTop: 7 },
  feet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 8,
  },
  foot: { width: 22, height: 7, borderRadius: 3, backgroundColor: "#15120e" },
  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 6,
    letterSpacing: 0.7,
    color: "#d3be91",
  },
});
