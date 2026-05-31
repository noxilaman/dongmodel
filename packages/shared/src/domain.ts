export const modongStates = [
  "โมดอง",
  "ต่อไม่เสร็จ",
  "ต่อแล้ว",
  "ปล่อยไปแล้ว",
  "หลุมดำ"
] as const;

export const wantedStates = [
  "กำลังงมเข็ม",
  "mission complete",
  "ห่างกันซักพัก",
  "เราขาดกัน"
] as const;

export const publicPhrases = {
  wantedShare: "อยากรับมาเลี้ยงดู",
  adoptedIn: "ได้รับมาเลี้ยงดูแล้ว",
  adoptedForward: "มีคนรับไปเลี้ยงดูต่อแล้ว"
} as const;

export type ModongState = (typeof modongStates)[number];
export type WantedState = (typeof wantedStates)[number];
