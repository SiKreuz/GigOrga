<script lang="ts">
  import Field from "./Field.svelte";

  type Contact = { name: string; company: string; phone: string; email: string; notes: string };

  let {
    contact,
    values,
    errors = {},
  }: {
    contact?: Contact;
    values?: Record<string, string>;
    errors?: Record<string, string>;
  } = $props();

  const value = (key: keyof Contact) => values?.[key] ?? contact?.[key] ?? "";
</script>

<div class="grid gap-4 sm:grid-cols-2">
  <Field id="name" label="Name" error={errors.name}>
    <input id="name" name="name" class="input" value={value("name")} required />
  </Field>
  <Field id="company" label="Firma / Band / Venue">
    <input id="company" name="company" class="input" value={value("company")} />
  </Field>
  <Field id="phone" label="Telefon">
    <input id="phone" name="phone" type="tel" class="input" value={value("phone")} />
  </Field>
  <Field id="email" label="E-Mail">
    <input id="email" name="email" type="email" class="input" value={value("email")} />
  </Field>
  <div class="sm:col-span-2">
    <Field id="notes" label="Notizen">
      <textarea id="notes" name="notes" rows="2" class="input">{value("notes")}</textarea>
    </Field>
  </div>
</div>
