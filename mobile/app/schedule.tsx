import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
import { conceptShows } from "../src/editorial";
import { siteUrl } from "../src/brand";
import { C, DISPLAY } from "../src/theme";
export default function Schedule() {
  const { station, clock } = useRadioContext();
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
        <Card
          title="Live station rotation"
          body="Tune in to NYC High Life Radio for the station’s live feed. A dated show schedule has not been published by the station."
        />
      )}
      <Section>THE SOUND HAS PERSONALITY</Section>
      <Text style={styles.title}>Meet your next{`\n`}favorite show.</Text>
      <Text style={styles.small}>
        Website concept shows · Hosts and broadcast schedule to be announced.
      </Text>
      {conceptShows.map((show) => (
        <View
          key={show.title}
          style={[
            styles.card,
            {
              backgroundColor: show.color,
              marginTop: 14,
              borderColor: show.color,
              padding: 22,
            },
          ]}
        >
          <Text
            style={{
              color: show.ink,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.4,
            }}
          >
            {show.time} · CONCEPT SHOW
          </Text>
          <Text
            style={{
              fontFamily: DISPLAY,
              fontSize: 52,
              lineHeight: 51,
              color: show.ink,
              marginTop: 22,
            }}
          >
            {show.title.toUpperCase()}
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: show.ink,
              marginTop: 12,
            }}
          >
            {show.copy}
          </Text>
          <Text style={{ fontSize: 10, color: show.ink, marginTop: 14 }}>
            Host announcement coming soon
          </Text>
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
