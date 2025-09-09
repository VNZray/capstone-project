/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("report_attachment").del();
  await knex("report_status_history").del();
  await knex("report").del();

  // Create sample users if they don't exist
  const existingUsers = await knex("user").select("id", "role").limit(5);
  
  if (existingUsers.length === 0) {
    // Insert sample tourism and tourist profiles
    await knex("tourism").insert([
      {
        id: "658a023d-aa5c-4b8a-a40e-461723a920fd",
        first_name: "Emmanuel",
        last_name: "Collao",
        position: "Manager",
        email: "admin@gmail.com",
        phone_number: "09876541231"
      }
    ]);

    await knex("tourist").insert([
      {
        id: "b312f8f6-8c97-11f0-931c-10ffe07a01e9",
        first_name: "John",
        middle_name: "M",
        last_name: "Doe",
        ethnicity: "Foreigner",
        birthday: "1990-05-15",
        age: 33,
        gender: "Male",
        nationality: "American",
        category: "Overseas",
        phone_number: "+639171234568",
        email: "john.doe@email.com",
        province_id: 20,
        municipality_id: 24,
        barangay_id: 1
      },
      {
        id: "b212fef0-8c97-11f0-931c-10ffe07a01e9",
        first_name: "Jane",
        middle_name: "A",
        last_name: "Smith",
        ethnicity: "Foreigner",
        birthday: "1988-08-22",
        age: 35,
        gender: "Female",
        nationality: "Canadian",
        category: "Overseas",
        phone_number: "+639171234569",
        email: "jane.smith@email.com",
        province_id: 20,
        municipality_id: 24,
        barangay_id: 1
      }
    ]);

    await knex("user").insert([
      {
        id: "8c962890-477d-46f9-8735-30b4b678b357",
        role: "Tourism",
        email: "admin@gmail.com",
        phone_number: "09876541231",
        password: "$2b$10$Ap.IWuUvSqWa0ygjPtEjn.HLHqtH0iBhaIu.Vgc6SyEBE25PPYrSC",
        tourism_id: "658a023d-aa5c-4b8a-a40e-461723a920fd"
      },
      {
        id: "b312fe93-8c97-11f0-931c-10ffe07a01e9",
        role: "Tourist",
        email: "john.doe@email.com",
        phone_number: "+639171234568",
        password: "$2b$10$Ap.IWuUvSqWa0ygjPtEjn.HLHqtH0iBhaIu.Vgc6SyEBE25PPYrSC",
        tourist_id: "b312f8f6-8c97-11f0-931c-10ffe07a01e9"
      },
      {
        id: "b212fef0-8c97-11f0-931c-10ffe07a01e9",
        role: "Tourist",
        email: "jane.smith@email.com",
        phone_number: "+639171234569",
        password: "$2b$10$Ap.IWuUvSqWa0ygjPtEjn.HLHqtH0iBhaIu.Vgc6SyEBE25PPYrSC",
        tourist_id: "b212fef0-8c97-11f0-931c-10ffe07a01e9"
      }
    ]);
  }

  // Get users for reports
  const users = await knex("user").select("id", "role").limit(5);
  const touristUsers = users.filter(u => u.role === "Tourist");
  const tourismUsers = users.filter(u => u.role === "Tourism");
  
  if (touristUsers.length === 0) {
    console.log("No tourist users found for seeding reports.");
    return;
  }

  // Sample report data
  const reports = [
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      reporter_id: touristUsers[0].id,
      target_type: "tourist_spot",
      target_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Facility Maintenance Issues",
      description: "The restroom facilities are in poor condition and the walking trails are not well maintained.",
      status: "under_review"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      reporter_id: touristUsers.length > 1 ? touristUsers[1].id : touristUsers[0].id,
      target_type: "tourist_spot",
      target_id: "550e8400-e29b-41d4-a716-446655440002",
      title: "Event Cancelled Without Notice",
      description: "The festival was cancelled last minute without proper notification to tourists who already paid for tickets.",
      status: "in_progress"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      reporter_id: touristUsers[0].id,
      target_type: "tourist_spot",
      target_id: "550e8400-e29b-41d4-a716-446655440003",
      title: "Overcharging Issue",
      description: "I was charged more than the advertised price without explanation. This seems like a scam.",
      status: "resolved"
    }
  ];

  // Insert reports
  await knex("report").insert(reports);

  // Insert status history for each report
  const statusHistories = [
    // For report 2 (under_review)
    {
      id: "650e8400-e29b-41d4-a716-446655440002",
      report_id: "550e8400-e29b-41d4-a716-446655440002",
      status: "submitted",
      remarks: "Report submitted by user",
      updated_by: null,
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440003",
      report_id: "550e8400-e29b-41d4-a716-446655440002",
      status: "under_review",
      remarks: "Report is being reviewed by our team",
      updated_by: tourismUsers.length > 0 ? tourismUsers[0].id : null,
      updated_at: new Date()
    },
    
    // For report 3 (in_progress)
    {
      id: "650e8400-e29b-41d4-a716-446655440004",
      report_id: "550e8400-e29b-41d4-a716-446655440003",
      status: "submitted",
      remarks: "Report submitted by user",
      updated_by: null,
      updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440005",
      report_id: "550e8400-e29b-41d4-a716-446655440003",
      status: "under_review",
      remarks: "Report validated, starting investigation",
      updated_by: tourismUsers.length > 0 ? tourismUsers[0].id : null,
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440006",
      report_id: "550e8400-e29b-41d4-a716-446655440003",
      status: "in_progress",
      remarks: "We're working on the issue",
      updated_by: tourismUsers.length > 0 ? tourismUsers[0].id : null,
      updated_at: new Date()
    },
    
    // For report 4 (resolved)
    {
      id: "650e8400-e29b-41d4-a716-446655440007",
      report_id: "550e8400-e29b-41d4-a716-446655440004",
      status: "submitted",
      remarks: "Report submitted by user",
      updated_by: null,
      updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440008",
      report_id: "550e8400-e29b-41d4-a716-446655440004",
      status: "under_review",
      remarks: "Investigating the overcharging claim",
      updated_by: tourismUsers.length > 0 ? tourismUsers[0].id : null,
      updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440009",
      report_id: "550e8400-e29b-41d4-a716-446655440004",
      status: "resolved",
      remarks: "Issue resolved. Refund has been processed and business has been warned.",
      updated_by: tourismUsers.length > 0 ? tourismUsers[0].id : null,
      updated_at: new Date()
    }
  ];

  await knex("report_status_history").insert(statusHistories);

  console.log("Report system seed data inserted successfully!");
}
