// Station rotation blocks; DJ show names are assigned separately.
window.HIGHLIFE_ROTATION = {
  "timezone": "America/New_York",
  "recurrence": "daily",
  "type": "station-rotation",
  "blocks": [
    {
      "id": "sunshine",
      "name": "Sunshine Morning Show",
      "time": "6 a.m. – 10 a.m.",
      "start": "06:00",
      "end": "10:00",
      "description": "Wake up your mind with music and everyday conversation: relationships, life, current topics and the things that get people thinking."
    },
    {
      "id": "early-bird",
      "name": "Early Bird Hour",
      "time": "10 a.m. – 12 p.m.",
      "description": "Keep the morning conversation going while the music plays. Fresh perspectives and everyday topics to get the mind moving.",
      "start": "10:00",
      "end": "12:00"
    },
    {
      "id": "noon-news",
      "name": "Noon News",
      "time": "12 p.m. – 1 p.m.",
      "start": "12:00",
      "description": "Brooklyn and Caribbean news, weather, sports, the economy, and traffic updates for Brooklyn and New York.",
      "end": "13:00"
    },
    {
      "id": "motion",
      "name": "Motion Hour",
      "time": "1 p.m. – 3 p.m.",
      "start": "13:00",
      "end": "15:00",
      "description": "Build the vibes and get in motion with music, energy and conversation about the news that just happened."
    },
    {
      "id": "lock-in",
      "name": "Lock-in Hour",
      "time": "3 p.m. – 6 p.m.",
      "start": "15:00",
      "end": "18:00",
      "description": "Stay locked in as the workday winds down: music and conversation for finishing up, heading out and making the journey home."
    },
    {
      "id": "evening-news",
      "name": "Evening News",
      "time": "6 p.m. – 7 p.m.",
      "start": "18:00",
      "description": "An evening news update before Icing In Hour: Brooklyn, Caribbean and New York developments, weather, sports, the economy and traffic.",
      "end": "19:00"
    },
    {
      "id": "icing-in",
      "name": "Icing In Hour",
      "time": "7 p.m. – 9 p.m.",
      "end": "21:00",
      "description": "The icing on the cake for the whole day. Settle into the evening with music, good energy and a final layer of vibes.",
      "start": "19:00"
    },
    {
      "id": "high-life-shift",
      "name": "High Life Shift",
      "time": "9 p.m. – midnight",
      "start": "21:00",
      "end": "00:00",
      "description": "Take the frequency into the night with the station’s late shift, music and connection."
    },
    {
      "id": "nightly-news",
      "name": "Nightly News",
      "time": "12 a.m. – 1 a.m.",
      "start": "00:00",
      "description": "The nightly news update at midnight, before the overnight replay rotation.",
      "end": "01:00"
    },
    {
      "id": "motion-replay",
      "name": "Motion Hour Replay",
      "time": "1 a.m. – 3 a.m.",
      "start": "01:00",
      "end": "03:00",
      "description": "Catch Motion Hour again overnight, including the conversation and news topics from the day.",
      "replayOf": "motion"
    },
    {
      "id": "lock-in-replay",
      "name": "Lock-in Hour Replay",
      "time": "3 a.m. – 6 a.m.",
      "start": "03:00",
      "end": "06:00",
      "description": "Replay Lock-in Hour through the early morning, leading into Sunshine Morning Show at 6 a.m.",
      "replayOf": "lock-in"
    }
  ],
  "commercials": {
    "cadence": "hourly",
    "minute": 0,
    "description": "Four commercial spots at the top of each hour, with a combined maximum of 3 minutes 30 seconds (210 seconds). A full window leaves 56 minutes 30 seconds for programming.",
    "slotsPerHour": 4,
    "maxSecondsPerHour": 210,
    "allowedSpotSeconds": [
      15,
      30,
      45,
      60
    ]
  }
};
