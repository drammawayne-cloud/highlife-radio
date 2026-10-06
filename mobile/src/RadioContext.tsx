import { createContext, useContext, type ReactNode } from "react";
import { useStation } from "./useStation";
import { useRadio } from "./useRadio";
function useRadioState() {
  const station = useStation();
  const audio = useRadio(station.station.streamUrl,
    station.track.fresh ? station.track.title : station.station.stationName,
    station.track.fresh ? station.track.artist : "Live radio");
  return { ...station, audio };
}
const RadioContext = createContext<ReturnType<typeof useRadioState> | null>(null);
export function RadioProvider({ children }: { children: ReactNode }) {
  const value = useRadioState();
  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}
export function useRadioContext() {
  const value = useContext(RadioContext);
  if (!value) throw new Error("RadioProvider is required");
  return value;
}
