import {
  deleteContact,
  getContact,
  listContacts,
  updateContact,
} from "$lib/server/services/contacts";
import { contactInput, test } from "$lib/server/testing";
import { describe, expect } from "vitest";

describe("contacts", () => {
  test("creates, updates and deletes a contact", async ({ db, insertContact }) => {
    const { id } = await insertContact();
    const input = contactInput();
    await updateContact(db, id, input);
    expect(await getContact(db, id)).toMatchObject(input);
    await deleteContact(db, id);
    expect(await getContact(db, id)).toBeUndefined();
  });

  test("lists contacts by name", async ({ db, insertContact }) => {
    await insertContact({ name: "zoe" });
    await insertContact({ name: "Anna" });
    expect((await listContacts(db)).map((contact) => contact.name)).toStrictEqual(["Anna", "zoe"]);
  });
});
