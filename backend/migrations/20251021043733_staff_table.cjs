const { createProcedures, dropProcedures } = require("../procedures/auth/staff.procedures.cjs");
const {
  createProcedures: createStaffOnboardingProcedures,
  dropProcedures: dropStaffOnboardingProcedures,
} = require("../procedures/auth/staff-onboarding.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("staff", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("first_name").notNullable();
    table.string("middle_name").nullable();
    table.string("last_name").notNullable();
    table.string("title", 50).nullable();

    table.string("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["user_id"], "idx_user_id");
    table.index(["business_id"], "idx_business_id");
  });

  // Create basic staff procedures (GetStaffById, etc.)
  await createProcedures(knex);
  // Create enhanced onboarding procedures (GetStaffByBusinessId with user info)
  await createStaffOnboardingProcedures(knex);

  console.log("Staff table and procedures created.");
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await dropStaffOnboardingProcedures(knex);
  await knex.schema.dropTableIfExists("staff");
};
