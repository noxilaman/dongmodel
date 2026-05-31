import { WantedState as PrismaWantedState } from "@prisma/client";
import type { WantedState } from "@dongmodel/shared";

const toPrismaState: Record<WantedState, PrismaWantedState> = {
  กำลังงมเข็ม: PrismaWantedState.NEEDLE_HUNTING,
  "mission complete": PrismaWantedState.MISSION_COMPLETE,
  ห่างกันซักพัก: PrismaWantedState.TAKING_A_BREAK,
  เราขาดกัน: PrismaWantedState.BROKEN_UP
};

const toDomainState: Record<PrismaWantedState, WantedState> = {
  [PrismaWantedState.NEEDLE_HUNTING]: "กำลังงมเข็ม",
  [PrismaWantedState.MISSION_COMPLETE]: "mission complete",
  [PrismaWantedState.TAKING_A_BREAK]: "ห่างกันซักพัก",
  [PrismaWantedState.BROKEN_UP]: "เราขาดกัน"
};

export function mapWantedStateToPrisma(state: WantedState): PrismaWantedState {
  return toPrismaState[state];
}

export function mapWantedStateToDomain(state: PrismaWantedState): WantedState {
  return toDomainState[state];
}
