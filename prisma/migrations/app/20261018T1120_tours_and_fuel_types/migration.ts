#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/3726f55cbe4786c3411f56927b04f305f32d94eca7e1f65930ef2efc74435292/contract';
import endContract from '../../snapshots/3726f55cbe4786c3411f56927b04f305f32d94eca7e1f65930ef2efc74435292/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/9d0fe1345d9cd762693ffec5f6644caeae67b8beb7be03fd8624d1754ff0d685/contract';
import startContract from '../../snapshots/9d0fe1345d9cd762693ffec5f6644caeae67b8beb7be03fd8624d1754ff0d685/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, dataTransform, fn, primaryKey } from '@prisma/orm-sqlite/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: 'tours',
        columns: [
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('id', 'TEXT', { notNull: true }),
          col('name', 'TEXT', { notNull: true }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        table: 'cars',
        column: {
          name: 'fuel',
          typeSql: 'TEXT',
          defaultSql: "DEFAULT 'diesel'",
          nullable: false,
        },
      }),
      this.addColumn({
        table: 'gigs',
        column: { name: 'diesel_price', typeSql: 'REAL', defaultSql: '', nullable: true },
      }),
      this.addColumn({
        table: 'gigs',
        column: { name: 'petrol_price', typeSql: 'REAL', defaultSql: '', nullable: true },
      }),
      this.addColumn({
        table: 'gigs',
        column: { name: 'return_km', typeSql: 'REAL', defaultSql: '', nullable: true },
      }),
      this.addColumn({
        table: 'gigs',
        column: { name: 'return_min', typeSql: 'INTEGER', defaultSql: '', nullable: true },
      }),
      this.addColumn({
        table: 'gigs',
        column: { name: 'tour_id', typeSql: 'TEXT', defaultSql: '', nullable: true },
      }),
      this.addColumn({
        table: 'settings',
        column: {
          name: 'diesel_price',
          typeSql: 'REAL',
          defaultSql: 'DEFAULT 1.7',
          nullable: false,
        },
      }),
      this.addColumn({
        table: 'settings',
        column: {
          name: 'petrol_price',
          typeSql: 'REAL',
          defaultSql: 'DEFAULT 1.8',
          nullable: false,
        },
      }),
      dataTransform({
        id: 'copy-gig-fuel-price',
        label: 'Copy gig fuel price into petrol and diesel price',
        table: 'gigs',
        description: 'Keep custom fuel prices of existing gigs',
        run: () => 'UPDATE "gigs" SET "petrol_price" = "fuel_price", "diesel_price" = "fuel_price"',
      }),
      dataTransform({
        id: 'copy-settings-fuel-price',
        label: 'Copy default fuel price into petrol and diesel price',
        table: 'settings',
        description: 'Keep the default fuel price',
        run: () => 'UPDATE "settings" SET "petrol_price" = "fuel_price", "diesel_price" = "fuel_price"',
      }),
      this.createIndex({ table: 'gigs', index: 'gigs_tour_id_idx_be575d54', columns: ['tour_id'] }),
      this.recreateTable({
        tableName: 'gigs',
        contractTable: {
          columns: [
            {
              name: 'accommodation_address',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            {
              name: 'accommodation_link',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            {
              name: 'accommodation_name',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            {
              name: 'accommodation_notes',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            {
              name: 'accommodation_paid',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            {
              name: 'accommodation_type',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT 'keine'",
              nullable: false,
            },
            { name: 'beds', typeSql: 'INTEGER', defaultSql: '', nullable: true },
            {
              name: 'breakfast',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            { name: 'buyout', typeSql: 'REAL', defaultSql: '', nullable: true },
            {
              name: 'catering',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            { name: 'check_in', typeSql: 'TEXT', defaultSql: "DEFAULT ''", nullable: false },
            { name: 'costs', typeSql: 'REAL', defaultSql: '', nullable: true },
            {
              name: 'created_at',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT (datetime('now'))",
              nullable: false,
            },
            { name: 'date', typeSql: 'TEXT', defaultSql: '', nullable: false },
            {
              name: 'deal_notes',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            {
              name: 'deal_type',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT 'festgage'",
              nullable: false,
            },
            { name: 'deposit', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'diesel_price', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'distance_km', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'door_percent', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'drinks', typeSql: 'TEXT', defaultSql: "DEFAULT ''", nullable: false },
            { name: 'duration_min', typeSql: 'INTEGER', defaultSql: '', nullable: true },
            {
              name: 'expected_attendance',
              typeSql: 'INTEGER',
              defaultSql: '',
              nullable: true,
            },
            { name: 'fee', typeSql: 'REAL', defaultSql: '', nullable: true },
            {
              name: 'gema_reported',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            {
              name: 'hospitality_notes',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            { name: 'id', typeSql: 'TEXT', defaultSql: '', nullable: false },
            {
              name: 'input_list_sent',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            {
              name: 'invoice_status',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT 'offen'",
              nullable: false,
            },
            { name: 'notes', typeSql: 'TEXT', defaultSql: "DEFAULT ''", nullable: false },
            {
              name: 'own_foh',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            { name: 'people', typeSql: 'INTEGER', defaultSql: '', nullable: true },
            { name: 'petrol_price', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'rent', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'return_km', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'return_min', typeSql: 'INTEGER', defaultSql: '', nullable: true },
            {
              name: 'rider_sent',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            {
              name: 'stage_plot_sent',
              typeSql: 'INTEGER',
              defaultSql: 'DEFAULT 0',
              nullable: false,
            },
            {
              name: 'status',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT 'anfrage'",
              nullable: false,
            },
            {
              name: 'tech_notes',
              typeSql: 'TEXT',
              defaultSql: "DEFAULT ''",
              nullable: false,
            },
            { name: 'ticket_door', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'ticket_presale', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'title', typeSql: 'TEXT', defaultSql: '', nullable: false },
            { name: 'tolls', typeSql: 'REAL', defaultSql: '', nullable: true },
            { name: 'tour_id', typeSql: 'TEXT', defaultSql: '', nullable: true },
            { name: 'type', typeSql: 'TEXT', defaultSql: "DEFAULT 'club'", nullable: false },
            { name: 'venue_id', typeSql: 'TEXT', defaultSql: '', nullable: true },
          ],
          primaryKey: { columns: ['id'] },
          uniques: [],
          foreignKeys: [
            {
              columns: ['venue_id'],
              references: { table: 'venues', columns: ['id'] },
              onDelete: 'setNull',
            },
            {
              columns: ['tour_id'],
              references: { table: 'tours', columns: ['id'] },
              onDelete: 'setNull',
            },
          ],
        },
        schemaColumnNames: [
          'accommodation_address',
          'accommodation_link',
          'accommodation_name',
          'accommodation_notes',
          'accommodation_paid',
          'accommodation_type',
          'beds',
          'breakfast',
          'buyout',
          'catering',
          'check_in',
          'costs',
          'created_at',
          'date',
          'deal_notes',
          'deal_type',
          'deposit',
          'diesel_price',
          'distance_km',
          'door_percent',
          'drinks',
          'duration_min',
          'expected_attendance',
          'fee',
          'fuel_price',
          'gema_reported',
          'hospitality_notes',
          'id',
          'input_list_sent',
          'invoice_status',
          'notes',
          'own_foh',
          'people',
          'petrol_price',
          'rent',
          'return_km',
          'return_min',
          'rider_sent',
          'stage_plot_sent',
          'status',
          'tech_notes',
          'ticket_door',
          'ticket_presale',
          'title',
          'tolls',
          'tour_id',
          'type',
          'venue_id',
        ],
        indexes: [
          { name: 'gigs_date_idx_b4ca319c', columns: ['date'] },
          { name: 'gigs_tour_id_idx_be575d54', columns: ['tour_id'] },
          { name: 'gigs_venue_id_idx_7506cf3f', columns: ['venue_id'] },
        ],
        summary:
          'Recreates table gigs to apply schema changes: database/gigs/foreign-key:tour_id->.tours(id)',
        postchecks: [
          {
            description: 'verify foreign key (venue_id) → venues(id) on "gigs"',
            sql: "SELECT EXISTS (SELECT 1 FROM pragma_foreign_key_list('gigs') f WHERE f.\"table\" = 'venues' GROUP BY f.id HAVING COUNT(*) = 1 AND SUM(CASE WHEN (f.\"from\", f.\"to\") IN (('venue_id', 'id')) THEN 1 ELSE 0 END) = 1)",
          },
          {
            description: 'verify foreign key (tour_id) → tours(id) on "gigs"',
            sql: "SELECT EXISTS (SELECT 1 FROM pragma_foreign_key_list('gigs') f WHERE f.\"table\" = 'tours' GROUP BY f.id HAVING COUNT(*) = 1 AND SUM(CASE WHEN (f.\"from\", f.\"to\") IN (('tour_id', 'id')) THEN 1 ELSE 0 END) = 1)",
          },
        ],
        operationClass: 'destructive',
      }),
      this.dropColumn({ table: 'gigs', column: 'fuel_price' }),
      this.dropColumn({ table: 'settings', column: 'fuel_price' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
