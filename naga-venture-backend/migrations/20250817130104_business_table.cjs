exports.up = function (knex) {
  return knex.schema.createTable("business", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.string("business_name", 50).notNullable();
    table.text("description").nullable();
    table.float("min_price").notNullable();
    table.float("max_price").notNullable();
    table.string("email", 40).notNullable();
    table.string("phone_number", 14).notNullable();
    table.integer("business_category_id").notNullable();
    table.integer("business_type_id").notNullable();
    table.integer("province_id").notNullable();
    table.integer("municipality_id").notNullable();
    table.integer("barangay_id").notNullable();
    table.uuid("owner_id").notNullable();
    table.enu("status", ["Pending", "Active", "Inactive", "Maintenance"]).notNullable();
    table.text("business_image").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.string("latitude", 30).notNullable();
    table.string("longitude", 30).notNullable();
    table.text("tiktok_url").nullable();
    table.text("facebook_url").nullable();
    table.text("instagram_url").nullable();
    table.boolean("hasBooking").notNullable().defaultTo(true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("business");
};
