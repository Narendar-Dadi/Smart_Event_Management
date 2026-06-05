const Event = require("../models/eventModel");
const INITIAL_EVENTS = require("../seed/initialEvents");

async function seedDatabase() {
  const count = await Event.countDocuments();
  if (count > 0) return;

  await Event.insertMany(INITIAL_EVENTS);
  console.log(`Seeded ${INITIAL_EVENTS.length} demo events`);
}

module.exports = { seedDatabase };
