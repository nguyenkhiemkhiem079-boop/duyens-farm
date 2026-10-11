export const FRIENDS = {
  khim: { name: 'Khim', icon: '👓', text: 'Khim là kỹ sư BIM, là chồng và người bạn đồng hành của Duyên.' },
  mochi: { name: 'Mochi', icon: '🐾', text: 'Mochi có bộ lông bò sữa, là bé được Duyên cưng nhất và là bạn thân của Mon.' },
  mon: { name: 'Mon', icon: '🐈', text: 'Mon nghịch ngợm, hay ăn vụng và là bạn thân của Mochi.' },
  may: { name: 'Mây', icon: '☁️', text: 'Mây có bộ lông trắng. [TODO: xác nhận tính cách của Mây]' },
} as const;
export type FriendId = keyof typeof FRIENDS;

// Appearance is an original stylization of the reference described in CODEX_PROMPT.md.
// [TODO: xác nhận kiểu tóc mặc định của Duyên]
export const DUYEN_LOOK = { hair: 0x3e2922, dress: 0xf2d575, bangle: 0xe79baf };
// [TODO: xác nhận màu lông thật của Mon]
export const MON_COLOR = 0xb8bcc4;
