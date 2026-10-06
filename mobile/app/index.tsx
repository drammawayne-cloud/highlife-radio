import { useState } from "react";
import { Link } from "expo-router";
import { Platform, Share, StyleSheet, Text, View } from "react-native";
import { useRadioContext } from "../src/RadioContext";
import { programming } from "../src/station";
import { Brand, Button, Card, Page, Section, styles, WEBSITE } from "../src/ui";
import { C } from "../src/theme";

export default function Home() {
  const {station,track,audio,clock}=useRadioContext();
  const programme=programming(station,new Date(clock));
  const [shareMessage,setShareMessage]=useState("");
  const share=()=>{
    setShareMessage("");
    void Share.share(Platform.OS==="ios"?{title:station.stationName,message:"Listen to High Life Radio. Caribbean Energy. Global Frequency.",url:WEBSITE}:
      {title:station.stationName,message:`Listen to High Life Radio. Caribbean Energy. Global Frequency. ${WEBSITE}`,url:WEBSITE})
      .catch((error:Error)=>{if(error.name!=="AbortError")setShareMessage("Sharing is unavailable here. You can share the station website link from your browser.");});
  };
  return <Page><Brand/>
    <View style={s.hero}><Text style={s.eyebrow}>NEW YORK × CARIBBEAN × THE WORLD</Text>
      <Text style={s.headline}>THE CARIBBEAN.{"\n"}THE WORLD.{"\n"}ONE FREQUENCY.</Text>
      <Text style={styles.body}>Music, culture and connection. Take High Life Radio with you, wherever life takes you.</Text>
      <Button label={audio.wanted||audio.playing?"Pause live radio":"Listen Live ▶"} selected disabled={!audio.ready} onPress={audio.toggle}/>
      <Text style={styles.small}>Free to listen · No account needed</Text>
    </View>
    <Section>ON AIR</Section>
    <Card title={programme.current?.show?.name||(track.live?"Live broadcast":station.stationName)}
      body={programme.current?.show?.description||"The station’s live music stream."}>
      <Text style={s.trackLabel}>{track.live?track.dj:"STATION ROTATION"}</Text>
      <Text style={s.track}>{track.fresh?track.title:"High Life Radio"}</Text>
      <Text style={styles.body}>{track.fresh?track.artist:"Live station · track information is currently unavailable"}</Text>
    </Card>
    {programme.next?.show&&<><Section>NEXT PROGRAMME</Section><Card title={programme.next.show.name} body={`${programme.next.slot.start} · ${station.timezone}`}/></>}
    {track.fresh&&track.next!=="To be announced"&&<><Section>UP NEXT</Section><Card title={track.next}/></>}
    <Section>STAY ON THE FREQUENCY</Section>
    <Link href="/schedule" style={s.link}>Explore programming →</Link>
    <Button label="Share High Life Radio ↗" onPress={share}/>
    {!!shareMessage&&<Text accessibilityLiveRegion="polite" style={styles.body}>{shareMessage}</Text>}
    <Text style={s.parent}>NYC High Life Entertainment · Worldwide</Text>
  </Page>;
}
const s=StyleSheet.create({hero:{paddingTop:35,paddingBottom:8},eyebrow:{color:C.acid,fontSize:10,fontWeight:"800",letterSpacing:1.3},
  headline:{color:"white",fontSize:39,fontWeight:"900",lineHeight:41,marginVertical:18},
  trackLabel:{color:C.acid,fontSize:10,fontWeight:"800",letterSpacing:1.3,marginTop:18},
  track:{color:"white",fontSize:20,fontWeight:"900",marginTop:8},link:{color:C.acid,padding:16,borderWidth:1,borderColor:"#3b443e",borderRadius:12,fontWeight:"800"},
  parent:{color:C.muted,textAlign:"center",fontSize:11,marginTop:26}});
