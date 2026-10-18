<script lang="ts">
  import Field from "./Field.svelte";

  type Venue = {
    name: string;
    address: string;
    city: string;
    capacity: number | null;
    website: string;
    loadIn: string;
    stage: string;
    notes: string;
  };

  let {
    venue,
    values,
    errors = {},
  }: { venue?: Venue; values?: Record<string, string>; errors?: Record<string, string> } = $props();

  const value = (key: keyof Venue) => values?.[key] ?? String(venue?.[key] ?? "");
</script>

<div class="grid gap-4 sm:grid-cols-2">
  <div class="sm:col-span-2">
    <Field id="name" label="Name" error={errors.name}>
      <input id="name" name="name" class="input" value={value("name")} required />
    </Field>
  </div>
  <Field id="address" label="Straße & Hausnummer">
    <input id="address" name="address" class="input" value={value("address")} />
  </Field>
  <Field id="city" label="PLZ & Ort">
    <input id="city" name="city" class="input" value={value("city")} />
  </Field>
  <Field id="capacity" label="Kapazität" error={errors.capacity}>
    <input
      id="capacity"
      name="capacity"
      class="input"
      inputmode="numeric"
      value={value("capacity")}
    />
  </Field>
  <Field id="stage" label="Bühne">
    <input
      id="stage"
      name="stage"
      class="input"
      value={value("stage")}
      placeholder="z. B. 6 × 4 m, 60 cm hoch"
    />
  </Field>
  <div class="sm:col-span-2">
    <Field id="website" label="Website">
      <input id="website" name="website" class="input" value={value("website")} />
    </Field>
  </div>
  <div class="sm:col-span-2">
    <Field id="loadIn" label="Ladezone / Parken">
      <textarea id="loadIn" name="loadIn" rows="2" class="input">{value("loadIn")}</textarea>
    </Field>
  </div>
  <div class="sm:col-span-2">
    <Field id="notes" label="Notizen">
      <textarea id="notes" name="notes" rows="2" class="input">{value("notes")}</textarea>
    </Field>
  </div>
</div>
