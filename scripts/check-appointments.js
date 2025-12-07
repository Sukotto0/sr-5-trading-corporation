/**
 * Script to check recent appointments in the database
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkRecentAppointments() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('appointments');

    // Get the 5 most recent appointments
    const recentAppointments = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log(`Found ${recentAppointments.length} recent appointments:\n`);

    recentAppointments.forEach((appt, index) => {
      console.log(`${index + 1}. Appointment ID: ${appt._id}`);
      console.log(`   Name: ${appt.firstName} ${appt.surname}`);
      console.log(`   Purpose: "${appt.purpose}"`);
      console.log(`   Date: ${appt.preferredDate}`);
      console.log(`   Time: ${appt.preferredTime}`);
      console.log(`   Location: ${appt.location}`);
      console.log(`   Status: ${appt.status || 'scheduled'}`);
      console.log(`   UserId: ${appt.userId || 'MISSING'}`);
      console.log(`   Created: ${appt.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkRecentAppointments();
