/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Inserts seed entries
  await knex("barangay").insert([
    { id: 1, name: "Abella", municipality_id: 24 },
    { id: 2, name: "Bagumbayan Norte", municipality_id: 24 },
    { id: 3, name: "Bagumbayan Sur", municipality_id: 24 },
    { id: 4, name: "Balatas", municipality_id: 24 },
    { id: 5, name: "Calauag", municipality_id: 24 },
    { id: 6, name: "Cararayan", municipality_id: 24 },
    { id: 7, name: "Carolina", municipality_id: 24 },
    { id: 8, name: "Concepcion Grande", municipality_id: 24 },
    { id: 9, name: "Concepcion Pequeña", municipality_id: 24 },
    { id: 10, name: "Dayangdang", municipality_id: 24 },
    { id: 11, name: "Del Rosario", municipality_id: 24 },
    { id: 12, name: "Dinaga", municipality_id: 24 },
    { id: 13, name: "Igualdad Interior", municipality_id: 24 },
    { id: 14, name: "Lerma", municipality_id: 24 },
    { id: 15, name: "Liboton", municipality_id: 24 },
    { id: 16, name: "Mabolo", municipality_id: 24 },
    { id: 17, name: "Pacol", municipality_id: 24 },
    { id: 18, name: "Panicuason", municipality_id: 24 },
    { id: 19, name: "Peñafrancia", municipality_id: 24 },
    { id: 20, name: "Sabang", municipality_id: 24 },
    { id: 21, name: "San Felipe", municipality_id: 24 },
    { id: 22, name: "San Francisco", municipality_id: 24 },
    { id: 23, name: "San Isidro", municipality_id: 24 },
    { id: 24, name: "Santa Cruz", municipality_id: 24 },
    { id: 25, name: "Tabuco", municipality_id: 24 },
    { id: 26, name: "Tinago", municipality_id: 24 },
    { id: 27, name: "Triangulo", municipality_id: 24 },
    { id: 28, name: "Paniman", municipality_id: 11 },
  ]);
}
