import { useState } from "react";
import { Link } from "expo-router";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRadioContext } from "../src/RadioContext";
import { programming } from "../src/station";
import {
  Brand,
  Button,
  Card,
  ExternalLink,
  Page,
  Section,
  styles,
  WEBSITE,
} from "../src/ui";
import { BRAND, siteUrl } from "../src/brand";
import { C, DISPLAY } from "../src/theme";
import { Vinyl } from "../src/Vinyl";
export default function Home() {
  const { station, track, audio, clock } = useRadioContext();
  const { width } = useWindowDimensions();
  const programme = programming(station, new Date(clock));
  const [shareMessage, setShareMessage] = useState("");
  const share = () => {
    setShareMessage("");
    void Share.share(
      Platform.OS === "ios"
        ? {
            title: BRAND.name,
            message: `${BRAND.name}. ${BRAND.tagline}`,
            url: WEBSITE,
          }
        : {
            title: BRAND.name,
            message: `${BRAND.name}. ${BRAND.tagline} ${WEBSITE}`,
            url: WEBSITE,
          },
    ).catch((error: Error) => {
      if (error.name !== "AbortError")
        setShareMessage(
          "Sharing is unavailable here. Share nychighliferadio.com from your browser.",
        );
    });
  };
  return (
    <Page>
      <Brand />
      <View style={s.hero}>
        <Text style={s.eyebrow}>From New York to the world.</Text>
        <Text
          accessibilityRole="header"
          style={[s.headline, width < 360 && { fontSize: 60, lineHeight: 55 }]}
        >
          NEW YORK{`\n`}ENERGY.{`\n`}
          <Text style={{ color: C.acid }}>CARIBBEAN</Text>
          {`\n`}
          <Text style={{ color: C.green }}>SOUL.</Text>
        </Text>
        <Text style={styles.body}>
          The culture. The connection. The soundtrack.{`\n`}Welcome to life on a
          higher frequency.
        </Text>
        <Button
          label={
            audio.wanted || audio.playing
              ? "Ⅱ Pause live radio"
              : "▶ Listen Live"
          }
          selected
          disabled={!audio.ready}
          onPress={audio.toggle}
        />
        <Text style={s.genres}>
          DANCEHALL <Text style={{ color: C.red }}>•</Text> REGGAE{" "}
          <Text style={{ color: C.red }}>•</Text> SOCA{" "}
          <Text style={{ color: C.red }}>•</Text> HIP-HOP{" "}
          <Text style={{ color: C.red }}>•</Text> R&B
        </Text>
      </View>
      <Section>ON THE FREQUENCY</Section>
      <View style={s.onAir}>
        <View style={s.airHeader}>
          <Text style={s.live}>
            {audio.playing && !audio.busy ? "● STREAMING LIVE" : "LIVE STATION"}
          </Text>
          <Text style={s.airStation}>NYC ↗ WORLDWIDE</Text>
        </View>
        <Text style={s.track}>
          {track.fresh ? track.title : station.stationName}
        </Text>
        <Text style={styles.body}>
          {track.fresh ? track.artist : "Press play to join the frequency"}
        </Text>
        <View style={s.rule} />
        <Text style={s.live}>ON AIR</Text>
        <Text style={s.show}>
          {programme.current?.show?.name ||
            (track.live ? track.dj : "Station rotation")}
        </Text>
        {track.fresh && track.next !== "To be announced" && (
          <>
            <Text style={[s.live, { marginTop: 18 }]}>UP NEXT</Text>
            <Text style={styles.body}>{track.next}</Text>
          </>
        )}
      </View>
      <Vinyl />
      <Section>BEYOND THE AIRWAVES</Section>
      <Text style={styles.title}>The culture{`\n`}moves with us.</Text>
      <View style={s.quickRow}>
        <Link href="/discover" style={s.quick}>
          <Text style={s.quickTitle}>NEWS &{`\n`}CULTURE ↗</Text>
        </Link>
        <Link href="/schedule" style={[s.quick, { borderBottomColor: C.red }]}>
          <Text style={s.quickTitle}>SHOWS &{`\n`}DJs ↗</Text>
        </Link>
      </View>
      <Card
        title="THE WINNING TEAM."
        body="Meet the voices behind the music. Explore Smokey Gwallaz and the people shaping our frequency."
      >
        <Link href="/discover" style={s.link}>
          Meet The Winning Team →
        </Link>
      </Card>
      <Section>TAKE THE VIBE OFFLINE</Section>
      <Card
        title="Good music. Real connection."
        body="Official event dates, venues and ticket links will appear on the website after approval."
      >
        <ExternalLink label="Explore events ↗" url={siteUrl("#events")} />
      </Card>
      <ExternalLink label="Visit nychighliferadio.com ↗" url={WEBSITE} />
      <Button label="Share NYC High Life Radio ↗" onPress={share} />
      {!!shareMessage && <Text style={styles.body}>{shareMessage}</Text>}
    </Page>
  );
}
const s = StyleSheet.create({
  hero: { paddingTop: 28 },
  eyebrow: {
    color: C.acid,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  headline: {
    color: C.paper,
    fontFamily: DISPLAY,
    fontSize: 70,
    lineHeight: 63,
    marginTop: 20,
    marginBottom: 14,
  },
  genres: {
    color: C.paper,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 20,
  },
  onAir: {
    backgroundColor: "#101b15",
    borderWidth: 1,
    borderColor: "#2d4435",
    borderLeftWidth: 3,
    borderLeftColor: C.green,
    padding: 18,
    borderRadius: 6,
  },
  airHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  airStation: { color: C.muted, fontSize: 7, letterSpacing: 1 },
  live: { color: C.green, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  track: {
    color: C.acid,
    fontFamily: DISPLAY,
    fontSize: 32,
    lineHeight: 34,
    marginTop: 12,
  },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 18 },
  show: { color: C.paper, fontSize: 14, fontWeight: "700", marginTop: 8 },
  quickRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  quick: {
    flex: 1,
    backgroundColor: C.panel,
    padding: 18,
    borderBottomWidth: 3,
    borderBottomColor: C.green,
    borderRadius: 5,
  },
  quickTitle: {
    fontFamily: DISPLAY,
    fontSize: 30,
    lineHeight: 29,
    color: C.paper,
  },
  link: { color: C.acid, fontWeight: "700", paddingVertical: 16 },
});
