/**
 * @param { import("knex").Knex } knex
 */
export async function seed (knex) {
  // Inserts seed entries
  await knex("municipality").insert([
    { id: 1, municipality: "Baao", province_id: 20 },
    { id: 2, municipality: "Balatan", province_id: 20 },
    { id: 3, municipality: "Bato", province_id: 20 },
    { id: 4, municipality: "Bombon", province_id: 20 },
    { id: 5, municipality: "Buhi", province_id: 20 },
    { id: 6, municipality: "Bula", province_id: 20 },
    { id: 7, municipality: "Cabusao", province_id: 20 },
    { id: 8, municipality: "Calabanga", province_id: 20 },
    { id: 9, municipality: "Camaligan", province_id: 20 },
    { id: 10, municipality: "Canaman", province_id: 20 },
    { id: 11, municipality: "Caramoan", province_id: 20 },
    { id: 12, municipality: "Del Gallego", province_id: 20 },
    { id: 13, municipality: "Gainza", province_id: 20 },
    { id: 14, municipality: "Garchitorena", province_id: 20 },
    { id: 15, municipality: "Goa", province_id: 20 },
    { id: 16, municipality: "Iriga City", province_id: 20 },
    { id: 17, municipality: "Lagonoy", province_id: 20 },
    { id: 18, municipality: "Libmanan", province_id: 20 },
    { id: 19, municipality: "Lupi", province_id: 20 },
    { id: 20, municipality: "Magarao", province_id: 20 },
    { id: 21, municipality: "Milaor", province_id: 20 },
    { id: 22, municipality: "Minalabac", province_id: 20 },
    { id: 23, municipality: "Nabua", province_id: 20 },
    { id: 24, municipality: "Naga City", province_id: 20 },
    { id: 25, municipality: "Ocampo", province_id: 20 },
    { id: 26, municipality: "Pamplona", province_id: 20 },
    { id: 27, municipality: "Pasacao", province_id: 20 },
    { id: 28, municipality: "Pili", province_id: 20 },
    { id: 29, municipality: "Presentacion", province_id: 20 },
    { id: 30, municipality: "Ragay", province_id: 20 },
    { id: 31, municipality: "Sagnay", province_id: 20 },
    { id: 32, municipality: "San Fernando", province_id: 20 },
    { id: 33, municipality: "San Jose", province_id: 20 },
    { id: 34, municipality: "Sipocot", province_id: 20 },
    { id: 35, municipality: "Siruma", province_id: 20 },
    { id: 36, municipality: "Tigaon", province_id: 20 },
    { id: 37, municipality: "Tinambac", province_id: 20 },
  ])
  .onConflict('id')
  .merge(['municipality', 'province_id']);
}
