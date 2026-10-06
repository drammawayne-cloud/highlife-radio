import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRadioContext } from "./RadioContext";
import { C } from "./theme";
export function LivePlayer() {
  const { station, track, audio } = useRadioContext();
  const active = audio.wanted || audio.playing;
  return <View style={s.box}>
    <View style={s.details}>
      <Text style={s.live}>{audio.playing && !audio.busy ? "● LIVE RADIO" : "LISTEN LIVE"}</Text>
      <Text numberOfLines={1} style={s.song}>{track.fresh ? track.title : station.stationName}</Text>
      <Text numberOfLines={2} accessibilityLiveRegion="polite" style={s.artist}>{audio.message}</Text>
    </View>
    <Pressable disabled={!audio.ready} accessibilityRole="button"
      accessibilityLabel={active ? "Pause High Life Radio" : "Play High Life Radio"}
      onPress={audio.toggle} style={({pressed}) => [s.play, pressed && {opacity:0.7}]}>
      {audio.busy ? <ActivityIndicator color="white" /> : <Text style={s.icon}>{active ? "Ⅱ" : "▶"}</Text>}
    </Pressable>
  </View>;
}
const s=StyleSheet.create({box:{backgroundColor:C.acid,padding:16,flexDirection:"row",alignItems:"center",gap:12},
  details:{flex:1,minWidth:0},live:{fontSize:10,fontWeight:"900",letterSpacing:1.4},
  song:{fontSize:17,fontWeight:"900",marginTop:5},artist:{fontSize:12,marginTop:4,color:C.ink},
  play:{width:54,height:54,borderRadius:27,backgroundColor:C.ink,alignItems:"center",justifyContent:"center"},
  icon:{color:"white",fontSize:20,fontWeight:"900"}});
