import { Injectable } from "@nestjs/common";
import {
  modongStates,
  type ModongState,
  type OwnerSummary,
  type ValueSummaryEntry,
  wantedStates,
  type WantedState
} from "@dongmodel/shared";
import type { ModongState as PrismaModongState, WantedState as PrismaWantedState } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { mapModongStateToDomain } from "../modong/modong-state.mapper";
import { mapWantedStateToDomain } from "../wanted/wanted-state.mapper";

type CountRow<State> = {
  state: State;
  _count: {
    _all: number;
  };
};

type SumValue = {
  toString(): string;
};

type ValueRow = {
  _sum: {
    purchaseAmount?: SumValue | null;
    releaseAmount?: SumValue | null;
  };
  purchaseCurrency?: string;
  releaseCurrency?: string;
};

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async show(ownerId: string): Promise<OwnerSummary> {
    const [
      modongStateRows,
      wantedStateRows,
      purchaseRows,
      releaseRows
    ] = await Promise.all([
      this.prisma.modong.groupBy({
        by: ["state"],
        where: { ownerId },
        _count: { _all: true }
      }),
      this.prisma.wantedItem.groupBy({
        by: ["state"],
        where: { ownerId },
        _count: { _all: true }
      }),
      this.prisma.modong.groupBy({
        by: ["purchaseCurrency"],
        where: {
          ownerId,
          purchaseAmount: { not: null }
        },
        _sum: { purchaseAmount: true }
      }),
      this.prisma.modong.groupBy({
        by: ["releaseCurrency"],
        where: {
          ownerId,
          releaseAmount: { not: null }
        },
        _sum: { releaseAmount: true }
      })
    ]);

    const modongByState = this.zeroModongCounts();
    for (const row of modongStateRows as CountRow<PrismaModongState>[]) {
      modongByState[mapModongStateToDomain(row.state)] = row._count._all;
    }

    const wantedByState = this.zeroWantedCounts();
    for (const row of wantedStateRows as CountRow<PrismaWantedState>[]) {
      wantedByState[mapWantedStateToDomain(row.state)] = row._count._all;
    }

    return {
      modongTotal: this.sumCounts(modongByState),
      wantedTotal: this.sumCounts(wantedByState),
      modongByState,
      wantedByState,
      privateValueSummary: {
        purchase: this.mapPurchaseRows(purchaseRows as ValueRow[]),
        release: this.mapReleaseRows(releaseRows as ValueRow[])
      }
    };
  }

  private zeroModongCounts(): Record<ModongState, number> {
    return Object.fromEntries(modongStates.map((state) => [state, 0])) as Record<
      ModongState,
      number
    >;
  }

  private zeroWantedCounts(): Record<WantedState, number> {
    return Object.fromEntries(wantedStates.map((state) => [state, 0])) as Record<
      WantedState,
      number
    >;
  }

  private sumCounts(counts: Record<string, number>): number {
    return Object.values(counts).reduce((total, count) => total + count, 0);
  }

  private mapPurchaseRows(rows: ValueRow[]): ValueSummaryEntry[] {
    return rows
      .map((row) => ({
        currency: row.purchaseCurrency ?? "THB",
        amount: row._sum.purchaseAmount?.toString() ?? "0"
      }))
      .filter((row) => row.amount !== "0");
  }

  private mapReleaseRows(rows: ValueRow[]): ValueSummaryEntry[] {
    return rows
      .map((row) => ({
        currency: row.releaseCurrency ?? "THB",
        amount: row._sum.releaseAmount?.toString() ?? "0"
      }))
      .filter((row) => row.amount !== "0");
  }
}
