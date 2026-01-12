const {
  createUserProcedures,
  dropUserProcedures,
} = require("../procedures/auth/user.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("user_role", (table) => {
    table.increments("id").primary();
    table.string("role_name", 20).notNullable();
    table.text("role_description").nullable();
    table.enum("role_type", ["system", "preset", "business"]).notNullable().defaultTo("system");
    table.boolean("is_immutable").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["role_type"], "idx_role_type");
  });

  await knex.schema.createTable("user", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // default UUID
    table.string("email", 40).notNullable().unique();
    table.string("phone_number", 13).notNullable().unique();
    table.text("password").notNullable();
    table.text("user_profile").nullable();
    table.string("otp", 6).nullable();
    table.boolean("is_verified").defaultTo(false);
    table.boolean("is_active").defaultTo(false); // Account active status (regularly used)
    table.boolean("is_online").defaultTo(false); // Real-time online status
    table.boolean("must_change_password").defaultTo(false);
    table.boolean("profile_completed").defaultTo(true);
    table.string("invitation_token", 64).nullable();
    table.timestamp("invitation_expires_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("last_login").nullable(); // Last successful login
    table.timestamp("last_seen").nullable(); // Last activity/heartbeat
    table.timestamp("last_activity").nullable(); // Last meaningful action

    table
      .integer("user_role_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("user_role")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

      table
        .integer("barangay_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("barangay")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    table.index(["invitation_token"], "idx_user_invitation_token");
  });

  // Create user_permissions table for per-user permissions (RBAC)
  await knex.schema.createTable("user_permissions", (table) => {
    table.increments("id").primary();

    table.uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    table.integer("permission_id")
      .unsigned()
      .notNullable();
    // Note: permission_id FK will be added after permissions table is created

    // Who granted this permission (business owner or admin)
    table.uuid("granted_by").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Unique constraint: one permission per user
    table.unique(["user_id", "permission_id"], "uq_user_permission");

    // Indexes for fast lookups
    table.index(["user_id"], "idx_user_permissions_user");
  });

  await createUserProcedures(knex);

  console.log("User tables (user_role, user, user_permissions) and procedures created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_permissions");
  await knex.schema.dropTableIfExists("user");
  await knex.schema.dropTableIfExists("user_role");
  await dropUserProcedures(knex);
};
