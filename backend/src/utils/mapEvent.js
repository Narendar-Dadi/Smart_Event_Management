function mapEvent(doc) {
  const event = doc.toObject ? doc.toObject() : doc;
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    time: event.time,
    venue: event.venue,
    capacity: event.capacity,
    registered: event.registered,
    fee: event.fee,
    image: event.image,
    organizer: event.organizer,
    status: event.status
  };
}

module.exports = { mapEvent };
