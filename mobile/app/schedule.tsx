import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRadioContext } from "../src/RadioContext";
import { stationTime } from "../src/station";
import {
  Brand,
  Button,
  Card,
  DAYS,
  ExternalLink,
  Page,
  Section,
  styles,
} from "../src/ui";
import { rotation } from "../src/rotation";
import { siteUrl } from "../src/brand";
import { C } from "../src/theme";
export default function Schedule() {
  const { station, clock } = useRadioContext();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedDay, setDay] = useState<number | null>(null);
  const day = selectedDay ?? stationTime(station.timezone, new Date(clock)).day;
  const slots = station.schedule
    .filter((slot) => slot.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
  return (
    <Page>
      <Brand />
      <Section>YOUR DAILY SOUNDTRACK</Section>
      <Text style={styles.title}>On the frequency.</Text>
      <Text style={styles.body}>
        All times shown in {station.timezone.replaceAll("_", " ")}. Live radio
        keeps playing as you browse.
      </Text>
      {station.schedule.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 16 }}
          >
            <View style={styles.row}>
              {DAYS.map((name, index) => (
                <Button
                  key={name}
                  label={name.slice(0, 3)}
                  selected={index === day}
                  onPress={() => setDay(index)}
                />
              ))}
            </View>
          </ScrollView>
          {slots.length ? (
            slots.map((slot) => {
              const show = station.shows.find(
                (show) => show.id === slot.showId,
              )!;
              const host = station.people.find(
                (person) => person.id === show.hostId,
              );
              return (
                <Card
                  key={`${slot.day}-${slot.start}-${slot.showId}`}
                  title={show.name}
                  body={show.description}
                >
                  <Text
                    style={{ color: C.acid, fontWeight: "800", marginTop: 12 }}
                  >
                    {slot.start}–{slot.end}
                    {slot.end <= slot.start ? " · continues next day" : ""}
                  </Text>
                  {host && (
                    <Text style={styles.body}>Hosted by {host.name}</Text>
                  )}
                </Card>
              );
            })
          ) : (
            <Card
              title="Station rotation"
              body="No named shows are scheduled for this day. Tune in to the live station."
            />
          )}
        </>
      ) : (
        <Text style={styles.small}>
          Daily rotation blocks · Individual DJ assignments announced
          separately.
        </Text>
      )}
      <Section>THE RHYTHM OF YOUR DAY</Section>
      <Text style={styles.body}>
        Select a rotation name for its time and details. All times are New York
        time.
      </Text>
      {rotation.map((show) => (
        <View
          key={show.name}
          style={[styles.card, { padding: 14, marginTop: 8 }]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={show.name}
            accessibilityState={{ expanded: expanded === show.name }}
            onPress={() =>
              setExpanded(expanded === show.name ? null : show.name)
            }
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: 44,
            }}
          >
            <Text style={[styles.cardTitle, { fontSize: 25, flex: 1 }]}>
              {show.name}
            </Text>
            <Text style={{ color: C.acid, fontSize: 24 }}>
              {expanded === show.name ? "−" : "+"}
            </Text>
          </Pressable>
          {expanded === show.name && (
            <View>
              <Text style={{ color: C.acid, marginTop: 8, fontWeight: "700" }}>
                {show.start}–{show.end}
              </Text>
              <Text style={styles.body}>{show.description}</Text>
              <Text style={styles.small}>Station rotation block</Text>
            </View>
          )}
        </View>
      ))}
      <ExternalLink
        label="Explore shows on the website ↗"
        url={siteUrl("#shows")}
      />
      {station.people.length > 0 && (
        <>
          <Section>THE VOICES</Section>
          {station.people.map((person) => (
            <Card
              key={person.id}
              title={person.name}
              body={`${person.role}${person.teamUnstoppable ? " · Team Unstoppable" : ""}`}
            >
              <Text style={styles.body}>{person.bio}</Text>
            </Card>
          ))}
        </>
      )}
      {station.events.length > 0 && (
        <>
          <Section>UPCOMING EVENTS</Section>
          {station.events
            .filter((event) => Date.parse(event.startsAt) > clock)
            .map((event) => (
              <Card key={event.id} title={event.name} body={event.description}>
                <Text style={styles.body}>
                  {new Date(event.startsAt).toLocaleString(undefined, {
                    timeZone: station.timezone,
                  })}{" "}
                  · {station.timezone}
                  {"\n"}
                  {event.venue}
                </Text>
                {event.url && (
                  <ExternalLink label="Event details ↗" url={event.url} />
                )}
              </Card>
            ))}
        </>
      )}
    </Page>
  );
}
