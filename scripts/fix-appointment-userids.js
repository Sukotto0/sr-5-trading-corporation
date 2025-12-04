/**
 * Script to add userId to existing appointments
 * This will prompt for your Clerk userId and update all appointments with matching email
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function updateAppointments() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  // Prompt for userId
  rl.question('Enter your Clerk userId (from browser console: user.id): ', async (userId) => {
    if (!userId || userId.trim() === '') {
      console.log('❌ UserId is required');
      rl.close();
      process.exit(1);
    }

    try {
      await client.connect();
      console.log('\nConnected to MongoDB\n');

      const db = client.db('main');
      const collection = db.collection('appointments');

      // Update all appointments that don't have a userId
      const result = await collection.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: userId.trim() } }
      );

      console.log(`✅ Updated ${result.modifiedCount} appointment(s) with userId: ${userId.trim()}\n`);

      // Show updated appointments
      const updatedAppointments = await collection
        .find({ userId: userId.trim() })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      console.log(`Found ${updatedAppointments.length} appointments for this user:\n`);
      updatedAppointments.forEach((appt, index) => {
        console.log(`${index + 1}. ${appt.purpose} - ${appt.preferredDate}`);
      });

    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      await client.close();
      rl.close();
      console.log('\nDisconnected from MongoDB');
    }
  });
}

updateAppointments();
