import { Image, Text, View } from "react-native";
import { Brand, Card, ExternalLink, Page, Section, styles } from "../src/ui";
import { siteUrl } from "../src/brand";
import { C, DISPLAY } from "../src/theme";
import { stories } from "../src/editorial";
export default function Discover() {
  return (
    <Page>
      <Brand />
      <Section>NYC HIGH LIFE RADIO NEWSROOM</Section>
      <Text style={styles.title}>Culture in{`\n`}conversation.</Text>
      <Text style={styles.body}>
        Brooklyn first. Caribbean always. Stories, voices and connections from
        our website.
      </Text>
      <ExternalLink
        label="All news · open the newsroom ↗"
        url={siteUrl("news/")}
      />
      <Section>FEATURED FROM THE WEBSITE</Section>
      {stories.map((story) => (
        <View
          key={story.url}
          style={[styles.card, { padding: 0, overflow: "hidden" }]}
        >
          <Image
            source={story.image}
            accessibilityLabel={story.alt}
            style={{ width: "100%", height: 180 }}
            resizeMode="cover"
          />
          <View style={{ padding: 18 }}>
            <Text
              style={{
                color: C.green,
                fontSize: 8,
                letterSpacing: 1.5,
                fontWeight: "800",
              }}
            >
              NEWS & COMMUNITY · CONCEPTUAL ILLUSTRATION
            </Text>
            <Text style={[styles.cardTitle, { marginTop: 10 }]}>
              {story.title}
            </Text>
            <ExternalLink label="Read the story ↗" url={story.url} />
          </View>
        </View>
      ))}
      <Section>THE PEOPLE BEHIND THE FREQUENCY</Section>
      <View
        style={[
          styles.card,
          {
            borderLeftColor: C.red,
            borderLeftWidth: 3,
            paddingBottom: 0,
            overflow: "hidden",
          },
        ]}
      >
        <Text
          style={{
            color: C.green,
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 1.5,
          }}
        >
          NYC HIGH LIFE RADIO
        </Text>
        <Text style={[styles.title, { fontSize: 54, lineHeight: 51 }]}>
          THE{`\n`}WINNING{`\n`}
          <Text style={{ color: C.acid }}>TEAM.</Text>
        </Text>
        <Text style={styles.body}>Meet the voices behind the music.</Text>
        <Image
          source={require("../assets/website/smokey-gwallaz.png")}
          accessibilityLabel="Smokey Gwallaz"
          style={{ height: 280, width: "100%", marginTop: 18 }}
          resizeMode="contain"
        />
        <View style={{ paddingBottom: 18 }}>
          <Text style={{ color: C.acid, fontFamily: DISPLAY, fontSize: 36 }}>
            SMOKEY GWALLAZ
          </Text>
          <Text style={styles.body}>
            Seasoned DJ · Producer · Artist · Radio personality
          </Text>
          <Text style={styles.small}>Radio slot · Schedule coming soon</Text>
          <ExternalLink
            label="Explore Smokey Gwallaz’s profile ↗"
            url={siteUrl("the-winning-team/smokey-gwallaz/")}
          />
          <ExternalLink
            label="Meet The Winning Team ↗"
            url={siteUrl("the-winning-team/")}
          />
        </View>
      </View>
      <Section>ONE TEAM. UNLIMITED ENERGY.</Section>
      <Card
        title="TEAM UNSTOPPABLE."
        body="The voices, selectors and creative minds behind the movement. An integrated part of NYC High Life Radio."
      >
        <ExternalLink
          label="Explore Team Unstoppable ↗"
          url={siteUrl("#team")}
        />
      </Card>
    </Page>
  );
}
