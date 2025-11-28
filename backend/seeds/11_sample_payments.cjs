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

  // Get existing bookings with all necessary fields
  const bookings = await knex("booking")
    .select(
      "id",
      "tourist_id",
      "total_price",
      "balance",
      "booking_status",
      "created_at",
      "check_in_date"
    )
    .orderBy("created_at", "asc");

  if (bookings.length === 0) {
    console.log("No bookings found, skipping payment seeds...");
    return;
  }

  const payments = [];
  // Payment methods matching migration schema
  const paymentMethods = ["gcash", "paymaya", "card", "grab_pay", "qrph", "cash_on_pickup"];
  const methodTypes = ["gcash", "paymaya", "credit_card", "debit_card", "grab_pay"];

  for (const booking of bookings) {
    // Skip canceled bookings - they typically don't have payments
    if (booking.booking_status === "Canceled") {
      continue;
    }

    // Determine payment details based on booking status
    let paymentType;
    let paymentAmount;
    let paymentStatus;
    let paymentFor = "booking"; // Changed from "Reservation" to match schema enum

    if (booking.booking_status === "Pending") {
      // Pending bookings have no payment yet
      continue;
    } else if (booking.booking_status === "Reserved") {
      // Reserved bookings have partial payment (50% down payment)
      paymentType = "Partial Payment";
      paymentAmount = booking.total_price * 0.5;
      paymentStatus = "paid"; // Initial payment is completed
    } else if (booking.booking_status === "Checked-In") {
      // Checked-in bookings have partial payment (50% down payment)
      paymentType = "Partial Payment";
      paymentAmount = booking.total_price * 0.5;
      paymentStatus = "paid"; // Initial payment is completed
    } else if (booking.booking_status === "Checked-Out") {
      // Checked-out bookings have full payment
      paymentType = "Full Payment";
      paymentAmount = booking.total_price;
      paymentStatus = "paid";
    }

    // Randomly select payment method
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const methodType = methodTypes[Math.floor(Math.random() * methodTypes.length)];

    // Generate provider reference for paid payments
    const providerReference = paymentStatus === "paid" 
      ? `${paymentMethod.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : null;

    // Create the initial payment
    payments.push({
      id: uuidv4(),
      payer_type: "Tourist",
      payment_type: paymentType,
      payment_method: paymentMethod,
      payment_method_type: paymentMethod === "card" ? methodType : null,
      amount: paymentAmount,
      status: paymentStatus,
      payment_for: paymentFor,
      payer_id: booking.tourist_id,
      payment_for_id: booking.id,
      provider_reference: providerReference,
      currency: "PHP",
      metadata: JSON.stringify({
        booking_status: booking.booking_status,
        payment_date: booking.created_at,
      }),
      created_at: booking.created_at,
      updated_at: booking.created_at,
    });

    // For Checked-Out bookings, create a second payment for the balance
    if (booking.booking_status === "Checked-Out") {
      // 70% of checked-out bookings had two separate payments
      if (Math.random() < 0.7) {
        // Update the first payment to be partial
        const firstPayment = payments[payments.length - 1];
        firstPayment.payment_type = "Partial Payment";
        firstPayment.amount = booking.total_price * 0.5;
        firstPayment.metadata = JSON.stringify({
          booking_status: "Reserved",
          payment_date: booking.created_at,
          note: "Initial reservation payment",
        });

        // Add balance payment (remaining 50%)
        const balancePaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const balanceMethodType = methodTypes[Math.floor(Math.random() * methodTypes.length)];

        // Balance payment comes on check-in date or 1-2 days after reservation
        const balanceDate = new Date(booking.check_in_date || booking.created_at);
        if (!booking.check_in_date) {
          balanceDate.setDate(balanceDate.getDate() + Math.floor(Math.random() * 2) + 1);
        }

        const balanceProviderRef = `${balancePaymentMethod.toUpperCase()}_${Date.now() + 1000}_${Math.random().toString(36).substr(2, 9)}`;

        payments.push({
          id: uuidv4(),
          payer_type: "Tourist",
          payment_type: "Partial Payment",
          payment_method: balancePaymentMethod,
          payment_method_type: balancePaymentMethod === "card" ? balanceMethodType : null,
          amount: booking.total_price * 0.5,
          status: "paid",
          payment_for: paymentFor,
          payer_id: booking.tourist_id,
          payment_for_id: booking.id,
          provider_reference: balanceProviderRef,
          currency: "PHP",
          metadata: JSON.stringify({
            booking_status: booking.booking_status,
            payment_date: balanceDate,
            note: "Balance payment on check-in",
          }),
          created_at: balanceDate,
          updated_at: balanceDate,
        });
      }
    }

    // For Reserved and Checked-In bookings with pending balance
    if (booking.booking_status === "Reserved" || booking.booking_status === "Checked-In") {
      // 20% have already paid the balance
      if (Math.random() < 0.2) {
        const balancePaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const balanceMethodType = methodTypes[Math.floor(Math.random() * methodTypes.length)];
        
        const balanceDate = new Date(booking.created_at);
        balanceDate.setDate(balanceDate.getDate() + Math.floor(Math.random() * 3) + 1);
        
        const balanceProviderRef = `${balancePaymentMethod.toUpperCase()}_${Date.now() + 2000}_${Math.random().toString(36).substr(2, 9)}`;

        payments.push({
          id: uuidv4(),
          payer_type: "Tourist",
          payment_type: "Partial Payment",
          payment_method: balancePaymentMethod,
          payment_method_type: balancePaymentMethod === "card" ? balanceMethodType : null,
          amount: booking.total_price * 0.5,
          status: "paid",
          payment_for: paymentFor,
          payer_id: booking.tourist_id,
          payment_for_id: booking.id,
          provider_reference: balanceProviderRef,
          currency: "PHP",
          metadata: JSON.stringify({
            booking_status: booking.booking_status,
            payment_date: balanceDate,
            note: "Early balance payment",
          }),
          created_at: balanceDate,
          updated_at: balanceDate,
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
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const paidPayments = payments.filter((p) => p.status === "paid").length;
    const pendingPayments = payments.filter((p) => p.status === "pending").length;
    const failedPayments = payments.filter((p) => p.status === "failed").length;

    console.log(`📊 Payment Summary:`);
    console.log(`   - Total Revenue: ₱${totalRevenue.toFixed(2)}`);
    console.log(`   - Paid Payments: ${paidPayments}`);
    console.log(`   - Pending Payments: ${pendingPayments}`);
    console.log(`   - Failed Payments: ${failedPayments}`);
    console.log(`\n   Payment Method Breakdown:`);
    console.log(`   - GCash: ${payments.filter((p) => p.payment_method === "gcash").length}`);
    console.log(`   - PayMaya: ${payments.filter((p) => p.payment_method === "paymaya").length}`);
    console.log(`   - Card: ${payments.filter((p) => p.payment_method === "card").length}`);
    console.log(`   - GrabPay: ${payments.filter((p) => p.payment_method === "grab_pay").length}`);
    console.log(`   - QR PH: ${payments.filter((p) => p.payment_method === "qrph").length}`);
    console.log(`   - Cash on Pickup: ${payments.filter((p) => p.payment_method === "cash_on_pickup").length}`);
    
    console.log(`\n   Payment Type Breakdown:`);
    console.log(`   - Full Payment: ${payments.filter((p) => p.payment_type === "Full Payment").length}`);
    console.log(`   - Partial Payment: ${payments.filter((p) => p.payment_type === "Partial Payment").length}`);
  } else {
    console.log("No payments to create (all bookings are canceled or pending)");
  }
};