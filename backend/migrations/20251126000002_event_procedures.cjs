/**
 * Event Stored Procedures Migration
 * 
 * Creates all stored procedures for event management
 */

exports.up = async function (knex) {
  const { createEventProcedures } = await import('../procedures/eventProcedures.js');
  await createEventProcedures(knex);
  console.log('Event stored procedures created.');
};

exports.down = async function (knex) {
  const { dropEventProcedures } = await import('../procedures/eventProcedures.js');
  await dropEventProcedures(knex);
  console.log('Event stored procedures dropped.');
};
