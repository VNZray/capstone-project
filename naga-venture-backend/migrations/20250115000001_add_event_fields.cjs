exports.up = function (knex) {
  return knex.schema.alterTable("event", (table) => {
    table.time("start_time").nullable();
    table.time("end_time").nullable();
    table.string("contact_number", 20).nullable();
    table.string("website", 255).nullable();
    table.string("facebook", 255).nullable();
    table.string("instagram", 255).nullable();
    table.string("twitter", 255).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("event", (table) => {
    table.dropColumn("start_time");
    table.dropColumn("end_time");
    table.dropColumn("contact_number");
    table.dropColumn("website");
    table.dropColumn("facebook");
    table.dropColumn("instagram");
    table.dropColumn("twitter");
  });
};
