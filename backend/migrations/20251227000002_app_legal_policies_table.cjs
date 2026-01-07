const {
  createAppLegalPoliciesProcedures,
  dropAppLegalPoliciesProcedures,
} = require("../procedures/appLegalPoliciesProcedures.cjs");

exports.up = async function (knex) {
  // Create app_legal_policies table for platform-wide Terms & Conditions and Privacy Policy
  await knex.schema.createTable("app_legal_policies", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    // Legal policy texts
    table.text("terms_and_conditions").nullable();
    table.text("privacy_policy").nullable();

    // Version control for audit trail
    table.integer("version").defaultTo(1);
    table.boolean("is_active").defaultTo(true);

    // Metadata - store as string without foreign key for flexibility
    table.string("updated_by", 36).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create initial record with empty policies
  await knex.raw(`
    INSERT INTO app_legal_policies (id, terms_and_conditions, privacy_policy, version, is_active)
    VALUES (UUID(), NULL, NULL, 1, true)
  `);

  await createAppLegalPoliciesProcedures(knex);
  console.log("✅ App legal policies table and procedures created successfully");
};

exports.down = async function (knex) {
  await dropAppLegalPoliciesProcedures(knex);
  await knex.schema.dropTableIfExists("app_legal_policies");
  console.log("✅ App legal policies table and procedures dropped successfully");
};
