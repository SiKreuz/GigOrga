#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/59e5816bb7c37d6b6fae1863807677ac39afc4599e9c40ec359fd17155e1c0bb/contract';
import endContract from '../../snapshots/59e5816bb7c37d6b6fae1863807677ac39afc4599e9c40ec359fd17155e1c0bb/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f9ae66b901b994fc9269be00421f020070b25dbb02028ff1af35dc1f7fe53f91/contract';
import startContract from '../../snapshots/f9ae66b901b994fc9269be00421f020070b25dbb02028ff1af35dc1f7fe53f91/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  foreignKey,
  lit,
  primaryKey,
} from '@prisma/orm-sqlite/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: 'setlist_entries',
        columns: [
          col('gig_id', 'TEXT', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('position', 'INTEGER', { notNull: true }),
          col('song_id', 'TEXT', { notNull: true }),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
          foreignKey(['song_id'], 'songs', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'songs',
        columns: [
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('duration_sec', 'INTEGER', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('notes', 'TEXT', { notNull: true, default: lit('') }),
          col('title', 'TEXT', { notNull: true }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        table: 'setlist_entries',
        index: 'setlist_entries_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
      this.createIndex({
        table: 'setlist_entries',
        index: 'setlist_entries_song_id_idx_2e2805d0',
        columns: ['song_id'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
