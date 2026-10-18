import { type Db, type Reader, transaction } from "../db";

export type ContactInput = {
  name: string;
  company: string;
  phone: string;
  email: string;
  notes: string;
};

export function createContact(db: Db, input: ContactInput): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.Contact.create({ id, ...input });
    return id;
  });
}

export async function updateContact(db: Db, id: string, input: ContactInput) {
  await transaction(db, (tx) => tx.orm.Contact.where({ id }).update(input));
}

export async function deleteContact(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Contact.where({ id }).delete());
}

export async function listContacts(db: Reader) {
  const contacts = await db.orm.Contact.select("id", "name", "company", "phone", "email").all();
  return contacts.toSorted((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export async function getContact(db: Reader, id: string) {
  return (await db.orm.Contact.where({ id }).first()) ?? undefined;
}
