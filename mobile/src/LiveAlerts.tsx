import { useEffect, useState } from "react";
import { Linking, Platform, Text, View } from "react-native";
import { Button, styles } from "./ui";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
const API = "https://highlife-live-alerts.dwaynev347.workers.dev";
const STORAGE = "highlife-live-alert-subscription";
export function LiveAlerts() {
  const eligible = Platform.OS === "ios" && Device.isDevice;
  const [available, setAvailable] = useState(false);
  const [subscription, setSubscription] = useState<{
    token: string;
    secret: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    void fetch(API + "/status")
      .then((r) => r.json())
      .then((d) => setAvailable(d.available === true))
      .catch(() => {});
    void SecureStore.getItemAsync(STORAGE)
      .then((v) => {
        if (v) setSubscription(JSON.parse(v));
      })
      .catch(() => {});
  }, []);
  const toggle = async () => {
    setBusy(true);
    setMessage("");
    try {
      const pending = await SecureStore.getItemAsync(STORAGE + "-pending");
      let saved = subscription || (pending ? JSON.parse(pending) : null);
      if (!saved) {
        const permission = await Notifications.requestPermissionsAsync();
        if (!permission.granted) {
          setMessage(
            "Notifications are off. You can allow them in your iPhone settings.",
          );
          return;
        }
        const token = String(
          (await Notifications.getDevicePushTokenAsync()).data,
        );
        saved = { token, secret: Crypto.randomUUID() };
        // Keep the installation secret if a network response is lost; retry safely.
        await SecureStore.setItemAsync(
          STORAGE + "-pending",
          JSON.stringify(saved),
        );
      }
      const response = await fetch(API + "/subscription", {
        method: subscription ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      });
      if (!response.ok)
        throw Error("We couldn’t update your alerts. Please try again.");
      if (subscription) {
        await SecureStore.deleteItemAsync(STORAGE);
        setSubscription(null);
        setMessage("Live-show alerts are off.");
      } else {
        await SecureStore.setItemAsync(STORAGE, JSON.stringify(saved));
        setSubscription(saved);
        setMessage(
          "You’re subscribed. We’ll let you know when a live DJ comes on air.",
        );
      }
      await SecureStore.deleteItemAsync(STORAGE + "-pending");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Never miss a live show.</Text>
      <Text style={styles.body}>
        Free alerts when a DJ goes live. Tap the notification to open your
        radio. Unsubscribe here anytime.
      </Text>
      <Button
        label={
          subscription
            ? "Turn off live-show alerts"
            : available && eligible
              ? "Subscribe to free live alerts"
              : "Live alerts are being connected"
        }
        disabled={busy || (!subscription && (!available || !eligible))}
        onPress={() => void toggle()}
      />
      {!eligible && (
        <Text style={styles.small}>
          Live alerts will be available in the iPhone app.
        </Text>
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {message}
        </Text>
      )}
      <Button
        label="Notification settings ↗"
        onPress={() => {
          void Linking.openSettings();
        }}
      />
    </View>
  );
}
