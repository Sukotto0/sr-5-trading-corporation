/**
 * Script to check exact name format in appointments
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkNames() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('appointments');

    // Get all appointments without userId
    const appointmentsWithoutUserId = await collection
      .find({ userId: { $exists: false } })
      .toArray();

    console.log(`Found ${appointmentsWithoutUserId.length} appointments without userId:\n`);
    
    appointmentsWithoutUserId.forEach((appt, index) => {
      console.log(`${index + 1}. ID: ${appt._id}`);
      console.log(`   firstName: "${appt.firstName}"`);
      console.log(`   surname: "${appt.surname}"`);
      console.log(`   email: "${appt.email}"`);
      console.log(`   purpose: "${appt.purpose}"`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkNames();
