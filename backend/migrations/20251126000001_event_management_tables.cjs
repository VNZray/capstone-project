/**
 * Event Management System Tables Migration
 * 
 * Tables created:
 * - event_category: Categories for events (Music Festival, Food Fair, etc.)
 * - event: Main event table with all event details
 * - event_image: Multiple images per event with primary designation
 * - event_tag: Promotional tags (Free Entry, Paid Event, Limited Slots, etc.)
 * - event_tag_map: Many-to-many relationship between events and tags
 * - event_schedule: For multi-day events or recurring event schedules
 * - event_review: User reviews and ratings for events
 * - event_review_photo: Photos attached to reviews
 * - event_featured: Featured events management with ordering and scheduling
 */

exports.up = async function (knex) {
  // Event Category Table
  await knex.schema.createTable("event_category", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.string("slug", 100).notNullable().unique();
    table.text("description").nullable();
    table.string("icon", 50).nullable(); // Icon identifier for UI
    table.string("color", 20).nullable(); // Color code for calendar display
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });

  // Event Tag Table (Free Entry, Paid Event, Limited Slots, etc.)
  await knex.schema.createTable("event_tag", (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable().unique();
    table.string("slug", 50).notNullable().unique();
    table.string("color", 20).nullable(); // Badge color
    table.string("icon", 50).nullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Main Event Table
  await knex.schema.createTable("event", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("name", 255).notNullable();
    table.text("description").notNullable(); // Rich text description
    table.text("short_description").nullable(); // Brief excerpt for cards
    
    // Date and Time
    table.datetime("start_date").notNullable();
    table.datetime("end_date").notNullable();
    table.string("timezone", 50).defaultTo("Asia/Manila");
    table.boolean("is_all_day").defaultTo(false);
    
    // Location
    table.integer("barangay_id").unsigned().nullable()
      .references("id").inTable("barangay")
      .onDelete("SET NULL").onUpdate("CASCADE");
    table.text("venue_name").nullable(); // Specific venue name
    table.text("address").nullable(); // Full address string
    table.decimal("latitude", 10, 8).nullable();
    table.decimal("longitude", 11, 8).nullable();
    
    // Category
    table.integer("event_category_id").unsigned().nullable()
      .references("id").inTable("event_category")
      .onDelete("SET NULL").onUpdate("CASCADE");
    
    // Pricing
    table.boolean("is_free").defaultTo(true);
    table.decimal("entry_fee", 10, 2).nullable();
    table.decimal("early_bird_price", 10, 2).nullable();
    table.datetime("early_bird_deadline").nullable();
    
    // Capacity
    table.integer("max_attendees").nullable();
    table.integer("current_attendees").defaultTo(0);
    table.boolean("registration_required").defaultTo(false);
    table.text("registration_url").nullable();
    
    // Organizer
    table.uuid("organizer_id").nullable(); // User or Business ID
    table.enu("organizer_type", ["user", "business", "tourism"]).defaultTo("tourism");
    table.string("organizer_name", 255).nullable();
    table.string("organizer_email", 255).nullable();
    table.string("organizer_phone", 20).nullable();
    
    // Contact & Links
    table.string("contact_phone", 20).nullable();
    table.string("contact_email", 255).nullable();
    table.string("website", 500).nullable();
    table.string("facebook_url", 500).nullable();
    table.string("instagram_url", 500).nullable();
    
    // Status & Workflow
    table.enu("status", [
      "draft",
      "pending",
      "approved",
      "rejected",
      "published",
      "cancelled",
      "completed",
      "archived"
    ]).notNullable().defaultTo("draft");
    table.text("rejection_reason").nullable();
    table.uuid("approved_by").nullable();
    table.timestamp("approved_at").nullable();
    
    // Featured
    table.boolean("is_featured").defaultTo(false);
    table.enu("featured_priority", ["high", "medium", "low"]).nullable();
    table.datetime("featured_start_date").nullable();
    table.datetime("featured_end_date").nullable();
    
    // Recurring Events
    table.boolean("is_recurring").defaultTo(false);
    table.json("recurrence_pattern").nullable(); // JSON: { type: 'weekly', days: [1,3,5], until: '2025-12-31' }
    table.uuid("parent_event_id").nullable(); // For recurring event instances
    
    // SEO & Meta
    table.string("slug", 300).nullable().unique();
    table.string("meta_title", 255).nullable();
    table.text("meta_description").nullable();
    
    // Analytics
    table.integer("view_count").defaultTo(0);
    table.integer("share_count").defaultTo(0);
    table.integer("bookmark_count").defaultTo(0);
    
    // Audit
    table.uuid("created_by").nullable();
    table.uuid("updated_by").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    
    // Indexes
    table.index("event_category_id", "idx_event_category");
    table.index("barangay_id", "idx_event_barangay");
    table.index("status", "idx_event_status");
    table.index("start_date", "idx_event_start_date");
    table.index("end_date", "idx_event_end_date");
    table.index("is_featured", "idx_event_featured");
    table.index("organizer_id", "idx_event_organizer");
    table.index(["status", "start_date"], "idx_event_status_date");
  });

  // Event Images Table
  await knex.schema.createTable("event_image", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("event_id").notNullable()
      .references("id").inTable("event")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.text("file_url").notNullable(); // Supabase storage URL
    table.string("file_name", 255).nullable();
    table.string("file_format", 10).notNullable(); // jpg, png, webp
    table.bigInteger("file_size").nullable(); // in bytes
    table.boolean("is_primary").defaultTo(false);
    table.string("alt_text", 255).nullable();
    table.integer("display_order").defaultTo(0);
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
    
    // Indexes
    table.index("event_id", "idx_event_image_event");
    table.index("is_primary", "idx_event_image_primary");
  });

  // Event-Tag Mapping (Many-to-Many)
  await knex.schema.createTable("event_tag_map", (table) => {
    table.uuid("event_id").notNullable()
      .references("id").inTable("event")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.integer("tag_id").unsigned().notNullable()
      .references("id").inTable("event_tag")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.primary(["event_id", "tag_id"]);
  });

  // Event Schedule Table (for multi-day events with different times)
  await knex.schema.createTable("event_schedule", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("event_id").notNullable()
      .references("id").inTable("event")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.string("title", 255).nullable(); // Schedule item title
    table.text("description").nullable();
    table.date("schedule_date").notNullable();
    table.time("start_time").nullable();
    table.time("end_time").nullable();
    table.string("location_override", 255).nullable();
    table.integer("display_order").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    
    // Index
    table.index("event_id", "idx_event_schedule_event");
    table.index("schedule_date", "idx_event_schedule_date");
  });

  // Event Review Table
  await knex.schema.createTable("event_review", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("event_id").notNullable()
      .references("id").inTable("event")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.uuid("user_id").notNullable();
    table.integer("rating").notNullable(); // 1-5 stars
    table.text("review_text").nullable(); // 500 word limit enforced in app
    table.boolean("is_verified_attendee").defaultTo(false);
    table.enu("status", ["pending", "approved", "flagged", "hidden"]).defaultTo("pending");
    table.boolean("is_featured").defaultTo(false);
    table.integer("helpful_count").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    
    // Unique constraint: one review per user per event
    table.unique(["event_id", "user_id"], "unique_event_user_review");
    
    // Indexes
    table.index("event_id", "idx_event_review_event");
    table.index("user_id", "idx_event_review_user");
    table.index("rating", "idx_event_review_rating");
    table.index("status", "idx_event_review_status");
  });

  // Event Review Photos
  await knex.schema.createTable("event_review_photo", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("review_id").notNullable()
      .references("id").inTable("event_review")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.text("file_url").notNullable();
    table.string("file_format", 10).notNullable();
    table.bigInteger("file_size").nullable();
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
    
    // Index
    table.index("review_id", "idx_event_review_photo_review");
  });

  // Featured Events Configuration (for advanced featured management)
  await knex.schema.createTable("event_featured_config", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("event_id").notNullable()
      .references("id").inTable("event")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.enu("display_location", [
      "homepage_hero",
      "homepage_carousel",
      "category_page",
      "sidebar",
      "search_results"
    ]).notNullable();
    table.integer("display_order").defaultTo(0);
    table.enu("priority", ["high", "medium", "low"]).defaultTo("medium");
    table.datetime("start_date").nullable();
    table.datetime("end_date").nullable();
    table.boolean("is_active").defaultTo(true);
    table.uuid("created_by").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    
    // Indexes
    table.index("event_id", "idx_featured_config_event");
    table.index("display_location", "idx_featured_config_location");
    table.index(["is_active", "display_location"], "idx_featured_config_active_location");
  });

  // Event Bookmark (User saves/favorites)
  await knex.schema.createTable("event_bookmark", (table) => {
    table.uuid("event_id").notNullable()
      .references("id").inTable("event")
      .onDelete("CASCADE").onUpdate("CASCADE");
    table.uuid("user_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.primary(["event_id", "user_id"]);
    
    // Index
    table.index("user_id", "idx_event_bookmark_user");
  });

  // Seed initial event categories
  await knex("event_category").insert([
    { name: "Music Festival", slug: "music-festival", description: "Live music concerts and festivals", icon: "music", color: "#9333EA" },
    { name: "Food Fair", slug: "food-fair", description: "Food festivals and culinary events", icon: "utensils", color: "#F97316" },
    { name: "Cultural Heritage", slug: "cultural-heritage", description: "Cultural and traditional events", icon: "landmark", color: "#EAB308" },
    { name: "Sports & Recreation", slug: "sports-recreation", description: "Sports events and recreational activities", icon: "trophy", color: "#22C55E" },
    { name: "Arts & Crafts", slug: "arts-crafts", description: "Art exhibitions and craft fairs", icon: "palette", color: "#EC4899" },
    { name: "Community Event", slug: "community-event", description: "Local community gatherings", icon: "users", color: "#3B82F6" },
    { name: "Religious Festival", slug: "religious-festival", description: "Religious celebrations and festivals", icon: "church", color: "#8B5CF6" },
    { name: "Trade & Expo", slug: "trade-expo", description: "Trade shows and exhibitions", icon: "building", color: "#64748B" },
    { name: "Workshop & Seminar", slug: "workshop-seminar", description: "Educational workshops and seminars", icon: "book-open", color: "#06B6D4" },
    { name: "Nature & Adventure", slug: "nature-adventure", description: "Outdoor and adventure events", icon: "mountain", color: "#10B981" }
  ]);

  // Seed initial event tags
  await knex("event_tag").insert([
    { name: "Free Entry", slug: "free-entry", color: "#22C55E", icon: "ticket" },
    { name: "Paid Event", slug: "paid-event", color: "#3B82F6", icon: "credit-card" },
    { name: "Limited Slots", slug: "limited-slots", color: "#F97316", icon: "users" },
    { name: "Early Bird Discount", slug: "early-bird", color: "#EAB308", icon: "clock" },
    { name: "Last Few Tickets", slug: "last-few-tickets", color: "#EF4444", icon: "alert-triangle" },
    { name: "Family Friendly", slug: "family-friendly", color: "#8B5CF6", icon: "heart" },
    { name: "Outdoor Event", slug: "outdoor", color: "#10B981", icon: "sun" },
    { name: "Indoor Event", slug: "indoor", color: "#64748B", icon: "home" },
    { name: "New", slug: "new", color: "#EC4899", icon: "sparkles" },
    { name: "Popular", slug: "popular", color: "#F59E0B", icon: "trending-up" }
  ]);

  console.log("Event management tables created successfully.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("event_bookmark");
  await knex.schema.dropTableIfExists("event_featured_config");
  await knex.schema.dropTableIfExists("event_review_photo");
  await knex.schema.dropTableIfExists("event_review");
  await knex.schema.dropTableIfExists("event_schedule");
  await knex.schema.dropTableIfExists("event_tag_map");
  await knex.schema.dropTableIfExists("event_image");
  await knex.schema.dropTableIfExists("event");
  await knex.schema.dropTableIfExists("event_tag");
  await knex.schema.dropTableIfExists("event_category");
  
  console.log("Event management tables dropped.");
};
