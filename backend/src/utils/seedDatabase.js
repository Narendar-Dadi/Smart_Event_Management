const Event = require("../models/eventModel");
const User = require("../models/userModel");
const INITIAL_EVENTS = require("../seed/initialEvents");

const DEFAULT_USERS = [
  {
    name: "Super Admin",
    email: "admin@smarthub.edu",
    password: "Admin@123",
    role: "admin"
  },
  {
    name: "Event Organizer",
    email: "organizer@smarthub.edu",
    password: "Organizer@123",
    role: "organizer"
  },
  {
    name: "Alex Student",
    email: "student@smarthub.edu",
    password: "Student@123",
    role: "student"
  }
];

async function seedDatabase() {
  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    await Event.insertMany(INITIAL_EVENTS);
    console.log(`Seeded ${INITIAL_EVENTS.length} demo events`);
  }

  for (const seedUser of DEFAULT_USERS) {
    const email = seedUser.email.toLowerCase();
    const existing = await User.findOne({ email }).select("+password");

    if (!existing) {
      await User.create(seedUser);
      console.log(`Seeded user: ${email} (${seedUser.role})`);
      continue;
    }

    existing.name = seedUser.name;
    existing.role = seedUser.role;
    existing.password = seedUser.password;
    await existing.save();
    console.log(`Updated seeded user: ${email} (${seedUser.role})`);
  }
}

module.exports = { seedDatabase, DEFAULT_USERS };
