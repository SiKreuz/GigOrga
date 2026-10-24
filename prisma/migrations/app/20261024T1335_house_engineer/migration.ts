#!/usr/bin/env -S bun
import type { Contract as Start } from '../../snapshots/7bc9240d28add0c960b3d91c89a56aa4d1df083d98f0d81985999b5113990216/contract';
import startContract from '../../snapshots/7bc9240d28add0c960b3d91c89a56aa4d1df083d98f0d81985999b5113990216/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f9ae66b901b994fc9269be00421f020070b25dbb02028ff1af35dc1f7fe53f91/contract';
import endContract from '../../snapshots/f9ae66b901b994fc9269be00421f020070b25dbb02028ff1af35dc1f7fe53f91/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-sqlite/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        table: 'gigs',
        column: {
          name: 'house_engineer',
          typeSql: 'INTEGER',
          defaultSql: 'DEFAULT 0',
          nullable: false,
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
