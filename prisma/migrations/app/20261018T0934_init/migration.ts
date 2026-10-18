#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/9d0fe1345d9cd762693ffec5f6644caeae67b8beb7be03fd8624d1754ff0d685/contract';
import endContract from '../../snapshots/9d0fe1345d9cd762693ffec5f6644caeae67b8beb7be03fd8624d1754ff0d685/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  foreignKey,
  lit,
  primaryKey,
} from '@prisma/orm-sqlite/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: 'backline_items',
        columns: [
          col('gig_id', 'TEXT', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('name', 'TEXT', { notNull: true }),
          col('note', 'TEXT', { notNull: true, default: lit('') }),
          col('position', 'INTEGER', { notNull: true }),
          col('provider', 'TEXT', { notNull: true, default: lit('unklar') }),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'cars',
        columns: [
          col('consumption', 'REAL', { notNull: true }),
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('id', 'TEXT', { notNull: true }),
          col('name', 'TEXT', { notNull: true }),
          col('seats', 'INTEGER'),
          col('standard', 'INTEGER', { notNull: true, default: lit(1) }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        table: 'contacts',
        columns: [
          col('company', 'TEXT', { notNull: true, default: lit('') }),
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('email', 'TEXT', { notNull: true, default: lit('') }),
          col('id', 'TEXT', { notNull: true }),
          col('name', 'TEXT', { notNull: true }),
          col('notes', 'TEXT', { notNull: true, default: lit('') }),
          col('phone', 'TEXT', { notNull: true, default: lit('') }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        table: 'gig_cars',
        columns: [
          col('car_id', 'TEXT', { notNull: true }),
          col('gig_id', 'TEXT', { notNull: true }),
        ],
        constraints: [
          primaryKey(['gig_id', 'car_id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
          foreignKey(['car_id'], 'cars', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'gig_contacts',
        columns: [
          col('contact_id', 'TEXT', { notNull: true }),
          col('gig_id', 'TEXT', { notNull: true }),
          col('role', 'TEXT', { notNull: true, default: lit('') }),
        ],
        constraints: [
          primaryKey(['gig_id', 'contact_id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
          foreignKey(['contact_id'], 'contacts', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'gigs',
        columns: [
          col('accommodation_address', 'TEXT', { notNull: true, default: lit('') }),
          col('accommodation_link', 'TEXT', { notNull: true, default: lit('') }),
          col('accommodation_name', 'TEXT', { notNull: true, default: lit('') }),
          col('accommodation_notes', 'TEXT', { notNull: true, default: lit('') }),
          col('accommodation_paid', 'INTEGER', { notNull: true, default: lit(0) }),
          col('accommodation_type', 'TEXT', { notNull: true, default: lit('keine') }),
          col('beds', 'INTEGER'),
          col('breakfast', 'INTEGER', { notNull: true, default: lit(0) }),
          col('buyout', 'REAL'),
          col('catering', 'INTEGER', { notNull: true, default: lit(0) }),
          col('check_in', 'TEXT', { notNull: true, default: lit('') }),
          col('costs', 'REAL'),
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('date', 'TEXT', { notNull: true }),
          col('deal_notes', 'TEXT', { notNull: true, default: lit('') }),
          col('deal_type', 'TEXT', { notNull: true, default: lit('festgage') }),
          col('deposit', 'REAL'),
          col('distance_km', 'REAL'),
          col('door_percent', 'REAL'),
          col('drinks', 'TEXT', { notNull: true, default: lit('') }),
          col('duration_min', 'INTEGER'),
          col('expected_attendance', 'INTEGER'),
          col('fee', 'REAL'),
          col('fuel_price', 'REAL'),
          col('gema_reported', 'INTEGER', { notNull: true, default: lit(0) }),
          col('hospitality_notes', 'TEXT', { notNull: true, default: lit('') }),
          col('id', 'TEXT', { notNull: true }),
          col('input_list_sent', 'INTEGER', { notNull: true, default: lit(0) }),
          col('invoice_status', 'TEXT', { notNull: true, default: lit('offen') }),
          col('notes', 'TEXT', { notNull: true, default: lit('') }),
          col('own_foh', 'INTEGER', { notNull: true, default: lit(0) }),
          col('people', 'INTEGER'),
          col('rent', 'REAL'),
          col('rider_sent', 'INTEGER', { notNull: true, default: lit(0) }),
          col('stage_plot_sent', 'INTEGER', { notNull: true, default: lit(0) }),
          col('status', 'TEXT', { notNull: true, default: lit('anfrage') }),
          col('tech_notes', 'TEXT', { notNull: true, default: lit('') }),
          col('ticket_door', 'REAL'),
          col('ticket_presale', 'REAL'),
          col('title', 'TEXT', { notNull: true }),
          col('tolls', 'REAL'),
          col('type', 'TEXT', { notNull: true, default: lit('club') }),
          col('venue_id', 'TEXT'),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['venue_id'], 'venues', ['id'], { onDelete: 'setNull' }),
        ],
      }),
      this.createTable({
        table: 'presale_links',
        columns: [
          col('gig_id', 'TEXT', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('label', 'TEXT', { notNull: true, default: lit('') }),
          col('position', 'INTEGER', { notNull: true }),
          col('url', 'TEXT', { notNull: true }),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'settings',
        columns: [
          col('band_size', 'INTEGER', { notNull: true, default: lit(4) }),
          col('fuel_price', 'REAL', { notNull: true, default: lit(1.8) }),
          col('home_address', 'TEXT', { notNull: true, default: lit('') }),
          col('home_lat', 'REAL'),
          col('home_lon', 'REAL'),
          col('id', 'TEXT', { notNull: true }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        table: 'support_acts',
        columns: [
          col('contact', 'TEXT', { notNull: true, default: lit('') }),
          col('gig_id', 'TEXT', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('link', 'TEXT', { notNull: true, default: lit('') }),
          col('name', 'TEXT', { notNull: true }),
          col('position', 'INTEGER', { notNull: true }),
          col('shares_backline', 'INTEGER', { notNull: true, default: lit(0) }),
          col('stage_time', 'TEXT', { notNull: true, default: lit('') }),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'timetable_entries',
        columns: [
          col('end', 'TEXT', { notNull: true, default: lit('') }),
          col('fixed', 'INTEGER', { notNull: true, default: lit(0) }),
          col('gig_id', 'TEXT', { notNull: true }),
          col('id', 'TEXT', { notNull: true }),
          col('kind', 'TEXT', { notNull: true }),
          col('label', 'TEXT', { notNull: true, default: lit('') }),
          col('position', 'INTEGER', { notNull: true }),
          col('start', 'TEXT', { notNull: true, default: lit('') }),
        ],
        constraints: [
          primaryKey(['id']),
          foreignKey(['gig_id'], 'gigs', ['id'], { onDelete: 'cascade' }),
        ],
      }),
      this.createTable({
        table: 'venues',
        columns: [
          col('address', 'TEXT', { notNull: true, default: lit('') }),
          col('capacity', 'INTEGER'),
          col('city', 'TEXT', { notNull: true, default: lit('') }),
          col('created_at', 'TEXT', { notNull: true, default: fn('now()') }),
          col('id', 'TEXT', { notNull: true }),
          col('lat', 'REAL'),
          col('load_in', 'TEXT', { notNull: true, default: lit('') }),
          col('lon', 'REAL'),
          col('name', 'TEXT', { notNull: true }),
          col('notes', 'TEXT', { notNull: true, default: lit('') }),
          col('stage', 'TEXT', { notNull: true, default: lit('') }),
          col('website', 'TEXT', { notNull: true, default: lit('') }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        table: 'backline_items',
        index: 'backline_items_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
      this.createIndex({
        table: 'gig_cars',
        index: 'gig_cars_car_id_idx_4e7b9f04',
        columns: ['car_id'],
      }),
      this.createIndex({
        table: 'gig_cars',
        index: 'gig_cars_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
      this.createIndex({
        table: 'gig_contacts',
        index: 'gig_contacts_contact_id_idx_f6f6ad79',
        columns: ['contact_id'],
      }),
      this.createIndex({
        table: 'gig_contacts',
        index: 'gig_contacts_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
      this.createIndex({ table: 'gigs', index: 'gigs_date_idx_b4ca319c', columns: ['date'] }),
      this.createIndex({
        table: 'gigs',
        index: 'gigs_venue_id_idx_7506cf3f',
        columns: ['venue_id'],
      }),
      this.createIndex({
        table: 'presale_links',
        index: 'presale_links_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
      this.createIndex({
        table: 'support_acts',
        index: 'support_acts_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
      this.createIndex({
        table: 'timetable_entries',
        index: 'timetable_entries_gig_id_idx_f99649af',
        columns: ['gig_id'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
