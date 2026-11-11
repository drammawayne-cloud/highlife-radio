import { LiveAlerts } from "../src/LiveAlerts";
import { useState } from "react";
import { Link } from "expo-router";
import { Text, View, StyleSheet, Share } from "react-native";
import { Brand, Page, Section, styles, ExternalLink, Button } from "../src/ui";
import { C, DISPLAY } from "../src/theme";
import { siteUrl } from "../src/brand";
export default function Menu() {
  const [message, setMessage] = useState("");
  return (
    <Page>
      <Brand />
      <Section>YOUR STATION, YOUR WAY</Section>
      <Text style={styles.title}>Explore the frequency.</Text>
      <Text style={styles.body}>Keep listening while you explore.</Text>
      <View style={{ marginTop: 20, gap: 12 }}>
        <Link href="/schedule" style={s.row}>
          <Text style={s.title}>Shows & daily rotation</Text>
          {"\n"}
          <Text style={s.caption}>The rhythm of your day ↗</Text>
        </Link>
        <Link href="/discover" style={s.row}>
          <Text style={s.title}>News & culture</Text>
          {"\n"}
          <Text style={s.caption}>Stories from our newsroom ↗</Text>
        </Link>
        <Link href="/about" style={s.row}>
          <Text style={s.title}>About & listening help</Text>
          {"\n"}
          <Text style={s.caption}>
            Volume, support and station information ↗
          </Text>
        </Link>
      </View>
      <Section>STAY IN THE LOOP</Section>
      <LiveAlerts />
      <Section>BEYOND THE AIRWAVES</Section>
      <ExternalLink label="Events ↗" url={siteUrl("#events")} />
      <ExternalLink label="Team Unstoppable ↗" url={siteUrl("#team")} />
      <ExternalLink label="Visit the station website ↗" url={siteUrl("")} />
      <Button
        label="Share the station ↗"
        onPress={() => {
          void Share.share({
            message: `Listen to NYC High Life Radio. ${siteUrl("")}`,
          }).catch(() =>
            setMessage("Share nychighliferadio.com from your browser."),
          );
        }}
      />
      {!!message && <Text style={styles.small}>{message}</Text>}
    </Page>
  );
}
const s = StyleSheet.create({
  row: {
    padding: 20,
    backgroundColor: "rgba(25,20,15,0.88)",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
  },
  title: { fontFamily: DISPLAY, fontSize: 29, color: C.paper },
  caption: { fontSize: 12, color: C.acid, lineHeight: 25 },
});
