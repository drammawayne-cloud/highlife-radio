// Station rotation approved by the owner. Individual DJ assignments are separate.
export const rotation = [
  {
    name: "Nightly News",
    start: "00:00",
    end: "01:00",
    description:
      "The nightly news update at midnight, before the overnight replay rotation.",
  },
  {
    name: "Motion Hour Replay",
    start: "01:00",
    end: "03:00",
    description:
      "Catch Motion Hour again overnight, including the conversation and news topics from the day.",
  },
  {
    name: "Lock-in Hour Replay",
    start: "03:00",
    end: "06:00",
    description:
      "Replay Lock-in Hour through the early morning, leading into Sunshine Morning Show at 6 a.m.",
  },
  {
    name: "Sunshine Morning Show",
    start: "06:00",
    end: "10:00",
    description:
      "Wake up your mind with music and everyday conversation: relationships, life, current topics and the things that get people thinking.",
  },
  {
    name: "Early Bird Hour",
    start: "10:00",
    end: "12:00",
    description:
      "Keep the morning conversation going while the music plays. Fresh perspectives and everyday topics to get the mind moving.",
  },
  {
    name: "Noon News",
    start: "12:00",
    end: "13:00",
    description:
      "Brooklyn and Caribbean news, weather, sports, the economy, and traffic updates for Brooklyn and New York.",
  },
  {
    name: "Motion Hour",
    start: "13:00",
    end: "15:00",
    description:
      "Build the vibes and get in motion with music, energy and conversation about the news that just happened.",
  },
  {
    name: "Lock-in Hour",
    start: "15:00",
    end: "18:00",
    description:
      "Stay locked in as the workday winds down: music and conversation for finishing up, heading out and making the journey home.",
  },
  {
    name: "Evening News",
    start: "18:00",
    end: "19:00",
    description:
      "Brooklyn, Caribbean and New York developments, weather, sports, the economy and traffic.",
  },
  {
    name: "Icing In Hour",
    start: "19:00",
    end: "21:00",
    description:
      "The icing on the cake for the whole day. Settle into the evening with music, good energy and a final layer of vibes.",
  },
  {
    name: "High Life Shift",
    start: "21:00",
    end: "00:00",
    description:
      "Take the frequency into the night with the station’s late shift, music and connection.",
  },
] as const;
