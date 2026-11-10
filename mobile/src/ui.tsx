import { useState, type ReactNode } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BRAND } from "./brand";
import { C, DISPLAY } from "./theme";
export const WEBSITE = BRAND.website;
export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function Page({ children }: { children: ReactNode }) {
  return (
    <ImageBackground
      source={require("../assets/website/broadcast-room.webp")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page}>
          {children}
          <Text style={styles.footer}>
            NYCHIGHLIFERADIO.COM · WORLDWIDE CONNECTION
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
export function Stripes() {
  return (
    <View style={{ flexDirection: "row", height: 3 }}>
      {[C.red, C.acid, C.green].map((color) => (
        <View key={color} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}
export function Brand() {
  return (
    <View>
      <View style={styles.brandRow}>
        <Image
          source={require("../assets/website/radio-logo.png")}
          accessibilityLabel={BRAND.name}
          style={{ width: 58, height: 58 }}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>
            NYC HIGH LIFE <Text style={{ color: C.acid }}>RADIO</Text>
          </Text>
          <Text style={styles.tag}>NEW YORK ENERGY. CARIBBEAN SOUL.</Text>
        </View>
        <View style={styles.frequency}>
          <View
            style={{
              height: 5,
              width: 5,
              borderRadius: 3,
              backgroundColor: C.green,
            }}
          />
          <Text style={{ color: C.green, fontSize: 8, fontWeight: "800" }}>
            ON THE AIR
          </Text>
        </View>
      </View>
      <Stripes />
    </View>
  );
}
export function Section({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}
export function Card({
  title,
  body,
  children,
}: {
  title?: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {body && <Text style={styles.body}>{body}</Text>}
      {children}
    </View>
  );
}
export function Button({
  label,
  onPress,
  selected = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        selected && { backgroundColor: C.acid, borderColor: C.acid },
        pressed && { opacity: 0.65 },
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text style={[styles.buttonText, selected && { color: C.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function ExternalLink({ label, url }: { label: string; url: string }) {
  const [error, setError] = useState("");
  return (
    <View>
      <Button
        label={label}
        onPress={() => {
          setError("");
          void Linking.openURL(url).catch(() =>
            setError("This link could not open. Please try again."),
          );
        }}
      />
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {error}
        </Text>
      )}
    </View>
  );
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "rgba(12, 8, 5, 0.78)" },
  page: { padding: 20, paddingTop: 10, paddingBottom: 30 },
  brandRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingBottom: 12,
  },
  brand: { color: C.paper, fontFamily: DISPLAY, fontSize: 23, lineHeight: 25 },
  tag: {
    color: C.muted,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  frequency: { alignItems: "center", gap: 5 },
  title: {
    color: C.paper,
    fontFamily: DISPLAY,
    fontSize: 45,
    lineHeight: 46,
    marginVertical: 12,
  },
  section: {
    color: C.acid,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 28,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "rgba(25, 20, 15, 0.86)",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    color: C.paper,
    fontFamily: DISPLAY,
    fontSize: 27,
    lineHeight: 29,
  },
  body: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 8 },
  button: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginTop: 10,
    minHeight: 48,
  },
  buttonText: { color: C.acid, fontWeight: "800", fontSize: 13 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  small: { color: C.muted, fontSize: 11, lineHeight: 18, marginTop: 6 },
  footer: {
    color: C.muted,
    fontSize: 8,
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 32,
  },
});
