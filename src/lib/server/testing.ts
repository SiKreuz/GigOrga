import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { faker } from "@faker-js/faker";
import { createSqliteControlClient } from "@prisma/orm-sqlite/control";
import { test as base } from "vitest";

import contractJson from "../../../prisma/contract.json" with { type: "json" };
import { createDb } from "./db";
import { type ContactInput, createContact } from "./services/contacts";
import { createGig, type GigBasics, type NewGig } from "./services/gigs";
import { createVenue, type VenueInput } from "./services/venues";

const migrationsDir = join(process.cwd(), "prisma/migrations");

async function migrate(path: string) {
  const client = createSqliteControlClient({ connection: path });
  try {
    const result = await client.migrate({
      contract: contractJson,
      migrationsDir,
      connection: path,
    });
    if (!result.ok) throw new Error(`${result.failure.summary}: ${result.failure.why}`);
  } finally {
    await client.close();
  }
}

export const venueInput = (overrides: Partial<VenueInput> = {}): VenueInput => ({
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  capacity: faker.number.int({ min: 50, max: 1000 }),
  website: faker.internet.url(),
  loadIn: faker.lorem.sentence(),
  stage: "6x4m",
  notes: faker.lorem.sentence(),
  ...overrides,
});

export const contactInput = (overrides: Partial<ContactInput> = {}): ContactInput => ({
  name: faker.person.fullName(),
  company: faker.company.name(),
  phone: faker.phone.number(),
  email: faker.internet.email(),
  notes: "",
  ...overrides,
});

export const gigBasics = (overrides: Partial<GigBasics> = {}): GigBasics => ({
  title: faker.music.album(),
  date: faker.date.future().toISOString().slice(0, 10),
  status: "anfrage",
  type: "club",
  venueId: null,
  notes: "",
  ...overrides,
});

export const test = base
  .extend("root", async ({ task }, { onCleanup }) => {
    const root = await mkdtemp(join(tmpdir(), `gigorga-${task.id}-`));
    onCleanup(() => rm(root, { recursive: true, force: true }));
    return root;
  })
  .extend("db", async ({ root }, { onCleanup }) => {
    const path = join(root, "test.db");
    await migrate(path);
    const db = createDb(path);
    onCleanup(() => db.close());
    return db;
  })
  .extend("insertVenue", ({ db }) => async (overrides: Partial<VenueInput> = {}) => {
    const input = venueInput(overrides);
    return { id: await createVenue(db, input), ...input };
  })
  .extend("insertContact", ({ db }) => async (overrides: Partial<ContactInput> = {}) => {
    const input = contactInput(overrides);
    return { id: await createContact(db, input), ...input };
  })
  .extend("insertGig", ({ db }) => async (overrides: Partial<NewGig> = {}) => {
    const { title, date, status, venueId } = gigBasics(overrides);
    const input = { title, date, status, venueId };
    return { id: await createGig(db, input), ...input };
  });
