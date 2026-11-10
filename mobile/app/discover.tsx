import { Image, Text, View } from "react-native";
import { Brand, Card, ExternalLink, Page, Section, styles } from "../src/ui";
import { siteUrl } from "../src/brand";
import { C } from "../src/theme";
import { useNews } from "../src/useNews";
export default function Discover() {
  const stories = useNews();
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
      {!stories.length && (
        <Card
          title="The latest from our newsroom"
          body="Open the newsroom for current station stories, culture and community updates."
        />
      )}
      {stories.map((story) => (
        <View
          key={story.url}
          style={[styles.card, { padding: 0, overflow: "hidden" }]}
        >
          {story.image && (
            <Image
              source={{ uri: story.image }}
              accessibilityLabel={story.alt}
              style={{ width: "100%", height: 180 }}
              resizeMode="cover"
            />
          )}
          <View style={{ padding: 18 }}>
            <Text
              style={{
                color: C.green,
                fontSize: 8,
                letterSpacing: 1.5,
                fontWeight: "800",
              }}
            >
              NEWS & COMMUNITY
            </Text>
            <Text style={[styles.cardTitle, { marginTop: 10 }]}>
              {story.title}
            </Text>
            <ExternalLink label="Read the story ↗" url={story.url} />
          </View>
        </View>
      ))}
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
