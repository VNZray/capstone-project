/**
 * Migration: Seasonal Pricing Table
 *
 * Allows businesses to configure seasonal and weekend pricing for rooms
 */
const {
  createSeasonalPricingProcedures,
  dropSeasonalPricingProcedures,
} = require("../procedures/accommodation/seasonal-pricing.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("seasonal_pricing", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    // Optional room-specific pricing (NULL = applies to all rooms in business)
    table.uuid("room_id").nullable()
      .references("id")
      .inTable("room")
      .onDelete("CASCADE");

    // Base pricing
    table.decimal("base_price", 10, 2).nullable();

    // Weekend pricing
    table.decimal("weekend_price", 10, 2).nullable();
    table.json("weekend_days").nullable(); // e.g., ["Friday", "Saturday", "Sunday"]

    // Peak season (highest demand)
    table.decimal("peak_season_price", 10, 2).nullable();
    table.json("peak_season_months").nullable(); // e.g., [6, 7, 8] for Jun-Aug

    // High season
    table.decimal("high_season_price", 10, 2).nullable();
    table.json("high_season_months").nullable(); // e.g., [12, 1, 2] for Dec-Feb

    // Low season
    table.decimal("low_season_price", 10, 2).nullable();
    table.json("low_season_months").nullable(); // Remaining months

    // Status
    table.boolean("is_active").defaultTo(true);

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexes for faster queries
    table.index("business_id", "idx_seasonal_pricing_business");
    table.index("room_id", "idx_seasonal_pricing_room");
  });

  await createSeasonalPricingProcedures(knex);

  console.log("✅ Seasonal pricing table and procedures created successfully");
};

exports.down = async function (knex) {
  await dropSeasonalPricingProcedures(knex);
  await knex.schema.dropTableIfExists("seasonal_pricing");
  console.log("✅ Seasonal pricing table and procedures dropped successfully");
};
