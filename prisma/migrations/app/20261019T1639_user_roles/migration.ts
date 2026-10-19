#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/5eb55c7d8dc2244916bbf755d83df68cb32989e09d0adccecff00a529754d67d/contract';
import endContract from '../../snapshots/5eb55c7d8dc2244916bbf755d83df68cb32989e09d0adccecff00a529754d67d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/97dc7e08346af0e4eb8dada17252120b0cafa109c00bb7871dae2c43b4ecd265/contract';
import startContract from '../../snapshots/97dc7e08346af0e4eb8dada17252120b0cafa109c00bb7871dae2c43b4ecd265/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-sqlite/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        table: 'users',
        column: { name: 'active', typeSql: 'INTEGER', defaultSql: 'DEFAULT 1', nullable: false },
      }),
      this.addColumn({
        table: 'users',
        column: {
          name: 'role',
          typeSql: 'TEXT',
          defaultSql: "DEFAULT 'viewer'",
          nullable: false,
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
