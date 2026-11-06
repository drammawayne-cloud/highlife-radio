import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { C } from "../src/theme";
import { RadioProvider } from "../src/RadioContext";
import { LivePlayer } from "../src/LivePlayer";
export { ErrorBoundary } from "expo-router";
export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed: require("../assets/website/BarlowCondensed-ExtraBold.ttf"),
  });
  if (!fontsLoaded && !fontError)
    return <View style={{ flex: 1, backgroundColor: C.ink }} />;
  return (
    <RadioProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: C.ink }}>
        <View
          style={{ flex: 1, width: "100%", maxWidth: 620, alignSelf: "center" }}
        >
          <Tabs
            screenOptions={{
              headerShown: false,
              sceneStyle: { backgroundColor: C.ink },
              tabBarActiveTintColor: C.acid,
              tabBarInactiveTintColor: C.muted,
              tabBarStyle: {
                backgroundColor: C.panel,
                borderTopColor: C.line,
                height: 68,
                paddingTop: 8,
                paddingBottom: 8,
              },
              tabBarLabelStyle: { fontWeight: "700", fontSize: 12 },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="radio"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="discover"
              options={{
                title: "Discover",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="compass-outline"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="schedule"
              options={{
                title: "Shows",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="about"
              options={{
                title: "More",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="information-outline"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
          </Tabs>
          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: C.panel }}>
            <LivePlayer />
          </SafeAreaView>
        </View>
      </View>
    </RadioProvider>
  );
}
