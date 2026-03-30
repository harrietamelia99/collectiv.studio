function splitGraphemes(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(s), (x) => x.segment);
  }
  return Array.from(s);
}

/** Curated groups for chat and captions — OS emoji keyboard still works alongside this picker. */
export const EMOJI_GROUPS: { id: string; label: string; emojis: string[] }[] = [
  {
    id: "smileys",
    label: "Smileys",
    emojis: splitGraphemes(
      "😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂😉😌😍🥰😘😗😙😚😋😛😜🤪😝🤑🤗🤭🫢🫣🤫🤔🫡🤐🤨😐😑😶😏😒🙄😬😮🤥😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕🫤😟🙁☹️😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀☠️💩🤡👹👺👻👽👾🤖😺😸😹😻😼😽🙀😿😾",
    ),
  },
  {
    id: "gestures",
    label: "Gestures",
    emojis: splitGraphemes(
      "👋🤚🖐️✋🖖👌🤌🤏✌️🤞🫰🤟🤘🤙👈👉👆🖕👇☝️🫵👍👎✊👊🤛🤜👏🙌🫶👐🤲🤝🙏✍️💅🤳💪🦾🦿🦵🦶👂🦻👃🧠🫀🫁🦷🦴👀👁️👅👄",
    ),
  },
  {
    id: "hearts",
    label: "Hearts",
    emojis: splitGraphemes("❤️🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝💟♥️💋💌"),
  },
  {
    id: "celebrate",
    label: "Celebrate",
    emojis: splitGraphemes(
      "🎉🎊🥳✨🎈🎁🏆🥇🥈🥉⚽🎯🔥💯✅☑️✔️👏🙌🫶🍾🥂🍻🎂🍰🧁🍭🎵🎶🎤🎧",
    ),
  },
  {
    id: "work",
    label: "Work",
    emojis: splitGraphemes(
      "💼📎📌📍✏️📝📋📧💻🖥️📱☎️📞📸📷🗓️📅⏰⏱️🔔✉️📬🔗🧾💡🔑🗝️🔒🔓✅❌❓❗️‼️⁉️💬💭🗨️",
    ),
  },
  {
    id: "nature",
    label: "Nature",
    emojis: splitGraphemes(
      "🌸🌺🌻🌼🌷🌹🥀🌱🌿☘️🍀🍁🍂🌳🌲🌴🌵🌊🔥☀️🌤️⛅️🌈⭐🌙⚡️☁️🦋🐝🐞🐚",
    ),
  },
  {
    id: "food",
    label: "Food",
    emojis: splitGraphemes(
      "☕️🫖🍵🧃🥤🍷🍺🥂🍰🧁🍩🍪🍫🍿🥐🥯🍞🥖🥨🧀🍳🥞🧇🥓🍔🍟🍕🌮🌯🥗🍜🍣🍱🥟🍙🍚",
    ),
  },
  {
    id: "symbols",
    label: "Symbols",
    emojis: splitGraphemes(
      "✨⭐️🌟💫⚡️💥💢💤💨🌈🔥💧☀️🌙➕➖✖️➗♾️〰️➰➿✔️☑️🔘🔴🟠🟡🟢🔵🟣⚫️⚪️🟤🔺🔻◾️◽️▪️▫️🔶🔷🔸🔹",
    ),
  },
];
