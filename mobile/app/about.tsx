import {Text,View} from "react-native";
import {useRadioContext} from "../src/RadioContext";
import {Brand,Button,Card,ExternalLink,Page,Section,styles,WEBSITE} from "../src/ui";
export default function About(){
  const {station,audio}=useRadioContext();
  return <Page><Brand/><Section>YOUR STATION</Section><Text style={styles.title}>Stay connected.</Text>
    <Card title="High Life Radio" body="Caribbean Energy. Global Frequency. Worldwide radio powered by Caribbean music, culture, personalities and community.">
      <Text style={styles.body}>NYC High Life Entertainment</Text><Text style={styles.small}>Version 1.0.0</Text>
    </Card>
    <Section>LISTENING CONTROLS</Section><Card title="Volume" body={`${Math.round(audio.volume*100)}% · Your device volume also controls listening level.`}>
      <View style={styles.row}><Button label="Volume down" onPress={()=>audio.changeVolume(audio.volume-.1)}/>
        <Button label={audio.volume===0?"Unmute":"Mute"} onPress={()=>audio.changeVolume(audio.volume===0?1:0)}/>
        <Button label="Volume up" onPress={()=>audio.changeVolume(audio.volume+.1)}/></View>
    </Card>
    <Section>HELP</Section>
    <Card title="No sound?" body="Check your device volume and headphones or Bluetooth connection. Use Play in the player below. If the station connection drops, the app attempts to reconnect; you can pause and play to retry."/>
    <Card title="Listening away from the app" body="The iPhone app supports background audio and lock-screen Play/Pause while you listen. Disconnecting headphones or another app taking over audio may pause the stream. Press Play when you are ready to resume."/>
    <Card title="Mobile data" body="Listening needs an internet connection. The shared station stream is approximately 192 kbps, about 86 MB per hour before network overhead. Use Wi-Fi to reduce mobile data usage."/>
    <ExternalLink label="Visit the station website ↗" url={WEBSITE}/>
    {station.contactEmail&&<ExternalLink label="Contact station support ↗" url={`mailto:${station.contactEmail}`}/>}
    {station.socialLinks.map(link=><ExternalLink key={link.url} label={`${link.label} ↗`} url={link.url}/>)}
    <Section>PRIVACY</Section>
    <Card title="No listener account required" body="This version has no account registration, purchases, advertising SDKs, location collection, microphone recording, or user submissions."/>
    <Card title="Connecting to the station" body="The app contacts the station’s public configuration, streaming and Now Playing services to play radio and show programme information. Those services receive network information such as your IP address, as part of providing the connection. Network information is handled by the station’s service providers. No listening account or personal profile is created in this app."/>
    <Card title="External links" body="Website and contact links open outside this app. Those services handle any information you choose to provide under their own policies."/>
  </Page>;
}
