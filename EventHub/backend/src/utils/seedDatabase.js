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

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create(DEFAULT_USERS);
    console.log(`Seeded ${DEFAULT_USERS.length} default users (admin, organizer, student)`);
  }
}

module.exports = { seedDatabase, DEFAULT_USERS };
