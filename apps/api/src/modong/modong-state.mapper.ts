import { ModongState as PrismaModongState } from "@prisma/client";
import type { ModongState } from "@dongmodel/shared";

const toPrismaState: Record<ModongState, PrismaModongState> = {
  โมดอง: PrismaModongState.MODONG,
  "ต่อไม่เสร็จ": PrismaModongState.UNFINISHED,
  ต่อแล้ว: PrismaModongState.COMPLETED,
  ปล่อยไปแล้ว: PrismaModongState.RELEASED,
  หลุมดำ: PrismaModongState.BLACK_HOLE
};

const toDomainState: Record<PrismaModongState, ModongState> = {
  [PrismaModongState.MODONG]: "โมดอง",
  [PrismaModongState.UNFINISHED]: "ต่อไม่เสร็จ",
  [PrismaModongState.COMPLETED]: "ต่อแล้ว",
  [PrismaModongState.RELEASED]: "ปล่อยไปแล้ว",
  [PrismaModongState.BLACK_HOLE]: "หลุมดำ"
};

export function mapModongStateToPrisma(state: ModongState): PrismaModongState {
  return toPrismaState[state];
}

export function mapModongStateToDomain(state: PrismaModongState): ModongState {
  return toDomainState[state];
}
