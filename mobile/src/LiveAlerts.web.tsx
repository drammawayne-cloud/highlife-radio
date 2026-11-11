import { Text, View } from "react-native";
import { styles } from "./ui";
export function LiveAlerts() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Live-show alerts</Text>
      <Text style={styles.body}>
        Free live-show notifications are being connected for the iPhone app.
        Keep listening here while we finish the setup.
      </Text>
    </View>
  );
}
