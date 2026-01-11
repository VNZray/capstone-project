const {
  createBusinessPoliciesProcedures,
  dropBusinessPoliciesProcedures,
} = require("../procedures/business/business-policies.procedures.cjs");

exports.up = async function (knex) {
  // Create business_policies table for house rules and policies
  await knex.schema.createTable("business_policies", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    // House Rules - Time-based rules
    table.time("check_in_time").nullable(); // e.g., '14:00:00'
    table.time("check_out_time").nullable(); // e.g., '11:00:00'
    table.time("quiet_hours_start").nullable(); // e.g., '22:00:00'
    table.time("quiet_hours_end").nullable(); // e.g., '07:00:00'

    // House Rules - Boolean flags
    table.boolean("pets_allowed").defaultTo(false);
    table.boolean("smoking_allowed").defaultTo(false);
    table.boolean("parties_allowed").defaultTo(false);
    table.boolean("children_allowed").defaultTo(true);
    table.boolean("visitors_allowed").defaultTo(true);

    // House Rules - Limits
    table.integer("max_guests_per_room").nullable();
    table.integer("minimum_age_requirement").nullable(); // e.g., 18 or 21

    // Policies - Text-based policies
    table.text("cancellation_policy").nullable(); // Detailed cancellation terms
    table.text("refund_policy").nullable(); // Detailed refund terms
    table.text("payment_policy").nullable(); // Payment terms and conditions
    table.text("damage_policy").nullable(); // Damage and security deposit terms
    table.text("pet_policy").nullable(); // Pet-related rules if pets_allowed
    table.text("smoking_policy").nullable(); // Smoking area details if applicable

    // Additional house rules (custom rules as JSON array)
    table.text("additional_rules").nullable(); // JSON array of custom rules

    // Terms and conditions
    table.text("terms_and_conditions").nullable(); // General T&C
    table.text("privacy_policy").nullable(); // Privacy policy text

    // Metadata
    table.boolean("is_active").defaultTo(true);
    table.integer("version").defaultTo(1);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Unique constraint - one active policy per business
    table.unique("business_id", "unique_business_policies");
  });

  // Create default policies for existing businesses
  await knex.raw(`
    INSERT INTO business_policies (id, business_id)
    SELECT UUID(), id FROM business
    WHERE NOT EXISTS (SELECT 1 FROM business_policies WHERE business_policies.business_id = business.id)
  `);

  await createBusinessPoliciesProcedures(knex);
  console.log("✅ Business policies table and procedures created successfully");
};

exports.down = async function (knex) {
  await dropBusinessPoliciesProcedures(knex);
  await knex.schema.dropTableIfExists("business_policies");
  console.log("✅ Business policies table and procedures dropped successfully");
};
