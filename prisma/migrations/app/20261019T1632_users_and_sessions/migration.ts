#!/usr/bin/env -S bun
import type { Contract as Start } from '../../snapshots/3726f55cbe4786c3411f56927b04f305f32d94eca7e1f65930ef2efc74435292/contract';
import startContract from '../../snapshots/3726f55cbe4786c3411f56927b04f305f32d94eca7e1f65930ef2efc74435292/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/97dc7e08346af0e4eb8dada17252120b0cafa109c00bb7871dae2c43b4ecd265/contract';
import endContract from '../../snapshots/97dc7e08346af0e4eb8dada17252120b0cafa109c00bb7871dae2c43b4ecd265/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  foreignKey,
  lit,
  primaryKey,
  unique,
} from '@prisma/orm-sqlite/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: 'sessions',
        columns: [
          col('expires_at', 'TEXT', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('user_id', 'TEXT', { notNull: true }),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['user_id'], 'users', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'users',
        columns: [
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('email', 'TEXT', { notNull: true, default: lit('') }),
          col('id', 'TEXT', { notNull: true }),
          col('last_login_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('name', 'TEXT', { notNull: true, default: lit('') }),
          col('subject', 'TEXT', { notNull: true }),
        ],
        constraints: [primaryKey(['id']), unique(['subject'])],
      }),
      this.createIndex({
        table: 'sessions',
        index: 'sessions_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
