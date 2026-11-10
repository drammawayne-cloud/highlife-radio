import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
export function NotificationNavigation() {
  const router = useRouter();
  useEffect(() => {
    const open = () => router.replace("/");
    const listener =
      Notifications.addNotificationResponseReceivedListener(open);
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          open();
          void Notifications.clearLastNotificationResponseAsync();
        }
      })
      .catch(() => {});
    return () => listener.remove();
  }, [router]);
  return null;
}
