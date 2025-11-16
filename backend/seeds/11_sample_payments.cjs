const { v4: uuidv4 } = require("uuid");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Check if payments already exist
  const existingPayments = await knex("payment").select("id").limit(1);

  if (existingPayments.length > 0) {
    console.log("Sample payments already exist, skipping...");
    return;
  }

  // Get existing bookings
  const bookings = await knex("booking")
    .select(
      "id",
      "tourist_id",
      "total_price",
      "balance",
      "booking_status",
      "created_at"
    )
    .orderBy("created_at", "asc");

  if (bookings.length === 0) {
    console.log("No bookings found, skipping payment seeds...");
    return;
  }

  const payments = [];
  const paymentMethods = ["Gcash", "Paymaya", "Credit Card", "Cash"];

  for (const booking of bookings) {
    // Skip canceled bookings - they typically don't have payments
    if (booking.booking_status === "Canceled") {
      continue;
    }

    // Determine payment type based on booking status
    let paymentType;
    let paymentAmount;
    let paymentStatus;
    let paymentFor = "Reservation";

    if (booking.booking_status === "Pending") {
      // Pending bookings have no payment yet
      continue;
    } else if (
      booking.booking_status === "Reserved" ||
      booking.booking_status === "Checked-In"
    ) {
      // Reserved/Checked-in bookings have partial payment (50% down payment)
      paymentType = "Partial Payment";
      paymentAmount = booking.total_price * 0.5;
      paymentStatus = "Pending Balance";
    } else if (booking.booking_status === "Checked-Out") {
      // Checked-out bookings have full payment
      paymentType = "Full Payment";
      paymentAmount = booking.total_price;
      paymentStatus = "Paid";
    }

    // Create the initial payment
    const paymentMethod =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    payments.push({
      id: uuidv4(),
      payer_type: "Tourist",
      payment_type: paymentType,
      payment_method: paymentMethod,
      amount: paymentAmount,
      status: paymentStatus,
      payment_for: paymentFor,
      payer_id: booking.tourist_id,
      payment_for_id: booking.id,
      created_at: booking.created_at,
    });

    // If checked-out and had a balance, create a second payment for the balance
    if (
      booking.booking_status === "Checked-Out" &&
      paymentType === "Full Payment"
    ) {
      // Some bookings might have been partial payment first, then balance payment
      // Let's create 30% of checked-out bookings with two payments
      if (Math.random() < 0.3) {
        // Remove the full payment we just added
        payments.pop();

        // Add partial payment (50% down payment)
        payments.push({
          id: uuidv4(),
          payer_type: "Tourist",
          payment_type: "Partial Payment",
          payment_method: paymentMethod,
          amount: booking.total_price * 0.5,
          status: "Paid",
          payment_for: "Reservation",
          payer_id: booking.tourist_id,
          payment_for_id: booking.id,
          created_at: booking.created_at,
        });

        // Add balance payment (remaining 50%)
        const balancePaymentMethod =
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Balance payment comes 1-3 days later
        const balanceDate = new Date(booking.created_at);
        balanceDate.setDate(balanceDate.getDate() + Math.floor(Math.random() * 3) + 1);

        payments.push({
          id: uuidv4(),
          payer_type: "Tourist",
          payment_type: "Partial Payment",
          payment_method: balancePaymentMethod,
          amount: booking.total_price * 0.5,
          status: "Paid",
          payment_for: "Pending Balance",
          payer_id: booking.tourist_id,
          payment_for_id: booking.id,
          created_at: balanceDate,
        });
      }
    }
  }

  // Insert all payments
  if (payments.length > 0) {
    await knex("payment").insert(payments);
    console.log(
      `✅ Successfully created ${payments.length} sample payments for bookings`
    );

    // Summary statistics
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const fullPayments = payments.filter((p) => p.status === "Paid").length;
    const pendingPayments = payments.filter(
      (p) => p.status === "Pending Balance"
    ).length;

    console.log(`📊 Payment Summary:`);
    console.log(`   - Total Revenue: ₱${totalRevenue.toFixed(2)}`);
    console.log(`   - Completed Payments: ${fullPayments}`);
    console.log(`   - Pending Balance: ${pendingPayments}`);
    console.log(
      `   - Gcash: ${payments.filter((p) => p.payment_method === "Gcash").length}`
    );
    console.log(
      `   - Paymaya: ${payments.filter((p) => p.payment_method === "Paymaya").length}`
    );
    console.log(
      `   - Credit Card: ${payments.filter((p) => p.payment_method === "Credit Card").length}`
    );
    console.log(
      `   - Cash: ${payments.filter((p) => p.payment_method === "Cash").length}`
    );
  } else {
    console.log("No payments to create (all bookings are canceled or pending)");
  }
};
