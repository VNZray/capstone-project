/**
 * Migration: Update Event Categories
 * 
 * Narrows the event categories to: cultural, food, adventure, religious, and other
 */

exports.up = async function (knex) {
  // First, delete all existing categories
  await knex("event_category").del();
  
  // Reset auto-increment (MySQL syntax)
  await knex.raw("ALTER TABLE event_category AUTO_INCREMENT = 1");
  
  // Insert the new narrowed categories
  await knex("event_category").insert([
    { 
      name: "Cultural", 
      slug: "cultural", 
      description: "Cultural celebrations, festivals, and heritage events", 
      icon: "landmark", 
      color: "#9333EA" 
    },
    { 
      name: "Food", 
      slug: "food", 
      description: "Food festivals, culinary events, and food fairs", 
      icon: "utensils", 
      color: "#F97316" 
    },
    { 
      name: "Adventure", 
      slug: "adventure", 
      description: "Outdoor activities, sports, and adventure events", 
      icon: "mountain", 
      color: "#10B981" 
    },
    { 
      name: "Religious", 
      slug: "religious", 
      description: "Religious festivals, celebrations, and spiritual events", 
      icon: "church", 
      color: "#8B5CF6" 
    },
    { 
      name: "Other", 
      slug: "other", 
      description: "Other types of events", 
      icon: "calendar", 
      color: "#64748B" 
    }
  ]);

  console.log("Event categories updated to: cultural, food, adventure, religious, other");
};

exports.down = async function (knex) {
  // Restore original categories
  await knex("event_category").del();
  
  await knex.raw("ALTER TABLE event_category AUTO_INCREMENT = 1");
  
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

  console.log("Event categories restored to original values");
};
