/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("report_attachment").del();
  await knex("report_status_history").del();
  await knex("report").del();

  // Get some existing user IDs for testing
  const users = await knex("user").select("id", "role").limit(5);
  
  if (users.length === 0) {
    console.log("No users found. Please seed users first.");
    return;
  }

  const touristUsers = users.filter(u => u.role === "Tourist");
  const tourismUsers = users.filter(u => u.role === "Tourism");
  
  if (touristUsers.length === 0) {
    console.log("No tourist users found for seeding reports.");
    return;
  }

  // Sample report data
  const reports = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      reporter_id: touristUsers[0].id,
      target_type: "business",
      target_id: "business-id-1",
      title: "Poor Service Quality",
      description: "The staff was unprofessional and the room was not clean upon arrival. Very disappointing experience.",
      status: "submitted"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      reporter_id: touristUsers[0].id,
      target_type: "tourist_spot",
      target_id: "spot-id-1",
      title: "Facility Maintenance Issues",
      description: "The restroom facilities are in poor condition and the walking trails are not well maintained.",
      status: "under_review"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      reporter_id: touristUsers.length > 1 ? touristUsers[1].id : touristUsers[0].id,
      target_type: "event",
      target_id: "event-id-1",
      title: "Event Cancelled Without Notice",
      description: "The festival was cancelled last minute without proper notification to tourists who already paid for tickets.",
      status: "in_progress"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      reporter_id: touristUsers[0].id,
      target_type: "accommodation",
      target_id: "accommodation-id-1",
      title: "Overcharging Issue",
      description: "I was charged more than the advertised price without explanation. This seems like a scam.",
      status: "resolved"
    }
  ];

  // Insert reports
  await knex("report").insert(reports);

  // Insert status history for each report
  const statusHistories = [
    // For report 1 (submitted)
    {
      id: "650e8400-e29b-41d4-a716-446655440001",
      report_id: "550e8400-e29b-41d4-a716-446655440001",
      status: "submitted",
      remarks: "Report submitted by user",
      updated_by: null,
      updated_at: new Date()
    },
    
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

  // Insert some sample attachments
  const attachments = [
    {
      id: "750e8400-e29b-41d4-a716-446655440001",
      report_id: "550e8400-e29b-41d4-a716-446655440001",
      file_url: "https://example-supabase-bucket.com/reports/evidence1.jpg",
      file_name: "dirty_room_evidence.jpg",
      file_type: "image/jpeg",
      file_size: 245760,
      uploaded_at: new Date()
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440002",
      report_id: "550e8400-e29b-41d4-a716-446655440004",
      file_url: "https://example-supabase-bucket.com/reports/receipt.jpg",
      file_name: "overcharge_receipt.jpg",
      file_type: "image/jpeg",
      file_size: 189440,
      uploaded_at: new Date()
    }
  ];

  await knex("report_attachment").insert(attachments);

  console.log("Report system seed data inserted successfully!");
}
