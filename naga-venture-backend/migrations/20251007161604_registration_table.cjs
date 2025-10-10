// migrations/xxxx_create_payment.js

exports.up = async function (knex) {
  await knex.schema.createTable("registration", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));

    table
      .enu("status", ["Pending", "Approved", "Rejected"])
      .defaultTo("Pending");
    table.text("message").nullable();

    table.timestamp("submitted_at").defaultTo(knex.fn.now());
    table.timestamp("approved_at").defaultTo(knex.fn.now());

    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    table
      .uuid("tourism_id")
      .nullable()
      .references("id")
      .inTable("tourism")
      .onDelete("CASCADE");

    table.index(["business_id"], "idx_business");
    table.index(["tourism_id"], "idx_tourism");
  });

};

exports.down = async function (knex) {
  await knex.schema.dropTable("registration");
};
