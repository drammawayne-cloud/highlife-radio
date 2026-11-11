import { Link } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Brand, Page, Section, styles } from "../src/ui";
import { RadioConsole } from "../src/RadioConsole";
import { useNews } from "../src/useNews";
import { newsLabel, type NewsStory } from "../src/news";
import { siteUrl } from "../src/brand";
import { C, DISPLAY } from "../src/theme";
export default function Home() {
  const stories = useNews();
  const captions: NewsStory[] = stories.length
    ? stories
    : [
        {
          title: "Brooklyn first. Caribbean always.",
          url: siteUrl("news/"),
          alt: "",
        },
      ];
  return (
    <Page>
      <Brand />
      <Text style={s.eyebrow}>FROM NEW YORK TO THE WORLD.</Text>
      <RadioConsole />
      <View style={s.newsHeader}>
        <Section>ON THE WIRE</Section>
        <Link href="/discover" style={s.all}>
          ALL NEWS ↗
        </Link>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel="Swipe through news headlines"
        contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
      >
        {captions.map((story, i) => (
          <Pressable
            key={story.url}
            accessibilityRole="link"
            accessibilityLabel={`Read ${story.title}`}
            onPress={() => {
              void Linking.openURL(story.url);
            }}
            style={s.story}
          >
            <Text style={s.number}>
              {story.source ? newsLabel(story) : `NEWS / ${String(i + 1).padStart(2, "0")}`} ↗
            </Text>
            <Text numberOfLines={3} style={s.caption}>
              {story.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.small}>
        {stories.length > 1
          ? "Swipe for more headlines →"
          : "Open the newsroom for the latest stories."}
      </Text>
      <Link href="./menu" style={s.menu}>
        EXPLORE YOUR STATION ☰
      </Link>
    </Page>
  );
}
const s = StyleSheet.create({
  eyebrow: {
    textAlign: "center",
    color: C.acid,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 15,
  },
  newsHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  all: { color: C.acid, fontSize: 10, fontWeight: "800" },
  story: {
    width: 250,
    minHeight: 120,
    padding: 16,
    backgroundColor: "rgba(29,25,19,0.9)",
    borderColor: "#665638",
    borderWidth: 1,
    borderRadius: 10,
  },
  number: {
    color: C.green,
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "800",
  },
  caption: {
    fontFamily: DISPLAY,
    color: C.paper,
    fontSize: 25,
    lineHeight: 27,
    marginTop: 10,
  },
  menu: {
    color: C.acid,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    padding: 18,
    marginTop: 12,
  },
});
