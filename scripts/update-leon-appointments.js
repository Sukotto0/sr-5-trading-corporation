/**
 * Script to add userId to existing appointments for Leon Scott Mantele
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function updateAppointments() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  const userId = 'user_2wMnkw6MLAPv6nXD0unQObsSg79';

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('appointments');

    // Update all appointments for Leon Scott Mantele based on email
    const result = await collection.updateMany(
      { 
        userId: { $exists: false },
        email: "leonscottmantele18@gmail.com"
      },
      { $set: { userId: userId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} appointment(s) with userId: ${userId}\n`);

    // Show all appointments for this user
    const userAppointments = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Total appointments for this user: ${userAppointments.length}\n`);
    userAppointments.forEach((appt, index) => {
      console.log(`${index + 1}. ${appt.purpose} - ${appt.preferredDate} at ${appt.preferredTime}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Done! Refresh your appointments page.');
  }
}

updateAppointments();
