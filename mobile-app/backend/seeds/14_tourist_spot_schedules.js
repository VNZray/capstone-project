/**
 * Seed the tourist_spot_schedules table for the tourist spots created in 09_tourist_spots.js
 * Assumptions:
 * - day_of_week: 0 (Sunday) ... 6 (Saturday)
 * - time format: HH:MM:SS (MySQL TIME)
 * - null open/close means open 24 hours
 * - is_closed = 1 means closed for the day
 *
 * This seed is idempotent for the specified spots: it deletes existing schedules for them, then re-inserts.
 * @param { import('knex').Knex } knex
 */
export async function seed(knex) {
  // Spot names from 09_tourist_spots.js
  const spotNames = [
    "Naga Metropolitan Cathedral",
    "Our Lady of Peñafrancia Basilica Minore",
    "Museo ni Jesse Robredo",
    "Plaza Rizal Naga",
    "Panicuason Hot Spring (Naga Side)",
  ];

  // Fetch their IDs from DB
  const spots = await knex("tourist_spots")
    .select("id", "name")
    .whereIn("name", spotNames);

  // Map name -> id for easy lookup
  const idByName = new Map(spots.map((s) => [s.name, s.id]));

  // If a spot wasn't found (e.g., seeds changed), warn and skip
  const missing = spotNames.filter((n) => !idByName.has(n));
  if (missing.length) {
    console.warn(
      `tourist_spot_schedules seed: missing spots (skipping): ${missing.join(", ")}`
    );
  }

  // Define a weekly schedule template helper
  const range = (n) => Array.from({ length: n }, (_, i) => i);

  const daily = (open, close) =>
    range(7).map((d) => ({ day_of_week: d, open_time: open, close_time: close, is_closed: 0 }));

  const closedOn = (base, closedDays) =>
    base.map((s) =>
      closedDays.includes(s.day_of_week)
        ? { ...s, open_time: null, close_time: null, is_closed: 1 }
        : s
    );

  // Define schedules per spot name
  /** @type {Record<string, Array<{day_of_week:number, open_time:string|null, close_time:string|null, is_closed:number}>>} */
  const schedulesByName = {
    // Cathedrals typically open early to late; use 05:00-20:00 daily
    "Naga Metropolitan Cathedral": daily("05:00:00", "20:00:00"),

    // Basilica: 05:00-20:00 daily
    "Our Lady of Peñafrancia Basilica Minore": daily("05:00:00", "20:00:00"),

    // Museum: 09:00-17:00, closed Monday (1)
    "Museo ni Jesse Robredo": closedOn(daily("09:00:00", "17:00:00"), [1]),

    // Plaza: Open 24/7 -> null times indicate 24 hours, not closed
    "Plaza Rizal Naga": range(7).map((d) => ({ day_of_week: d, open_time: null, close_time: null, is_closed: 0 })),

    // Hot spring: 08:00-18:00 daily
    "Panicuason Hot Spring (Naga Side)": daily("08:00:00", "18:00:00"),
  };

  // Prepare rows for insertion
  const rows = [];
  for (const name of spotNames) {
    const spotId = idByName.get(name);
    if (!spotId) continue;
    const scheds = schedulesByName[name] || [];
    for (const s of scheds) {
      rows.push({
        tourist_spot_id: spotId,
        day_of_week: s.day_of_week,
        open_time: s.open_time,
        close_time: s.close_time,
        is_closed: s.is_closed,
      });
    }
  }

  if (!rows.length) return;

  // Idempotent upsert (delete then insert) inside a transaction
  await knex.transaction(async (trx) => {
    const spotIds = [...new Set(rows.map((r) => r.tourist_spot_id))];
    await trx("tourist_spot_schedules").whereIn("tourist_spot_id", spotIds).del();
    await trx("tourist_spot_schedules").insert(rows);
  });
}
