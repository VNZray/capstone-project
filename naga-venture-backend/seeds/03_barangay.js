/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Inserts seed entries
  await knex("barangay").insert([
    { id: 1, barangay: "Abella", municipality_id: 24 },
    { id: 2, barangay: "Bagumbayan Norte", municipality_id: 24 },
    { id: 3, barangay: "Bagumbayan Sur", municipality_id: 24 },
    { id: 4, barangay: "Balatas", municipality_id: 24 },
    { id: 5, barangay: "Calauag", municipality_id: 24 },
    { id: 6, barangay: "Cararayan", municipality_id: 24 },
    { id: 7, barangay: "Carolina", municipality_id: 24 },
    { id: 8, barangay: "Concepcion Grande", municipality_id: 24 },
    { id: 9, barangay: "Concepcion Pequeña", municipality_id: 24 },
    { id: 10, barangay: "Dayangdang", municipality_id: 24 },
    { id: 11, barangay: "Del Rosario", municipality_id: 24 },
    { id: 12, barangay: "Dinaga", municipality_id: 24 },
    { id: 13, barangay: "Igualdad Interior", municipality_id: 24 },
    { id: 14, barangay: "Lerma", municipality_id: 24 },
    { id: 15, barangay: "Liboton", municipality_id: 24 },
    { id: 16, barangay: "Mabolo", municipality_id: 24 },
    { id: 17, barangay: "Pacol", municipality_id: 24 },
    { id: 18, barangay: "Panicuason", municipality_id: 24 },
    { id: 19, barangay: "Peñafrancia", municipality_id: 24 },
    { id: 20, barangay: "Sabang", municipality_id: 24 },
    { id: 21, barangay: "San Felipe", municipality_id: 24 },
    { id: 22, barangay: "San Francisco", municipality_id: 24 },
    { id: 23, barangay: "San Isidro", municipality_id: 24 },
    { id: 24, barangay: "Santa Cruz", municipality_id: 24 },
    { id: 25, barangay: "Tabuco", municipality_id: 24 },
    { id: 26, barangay: "Tinago", municipality_id: 24 },
    { id: 27, barangay: "Triangulo", municipality_id: 24 },
    { id: 28, barangay: "Paniman", municipality_id: 11 },
  ]);
}
