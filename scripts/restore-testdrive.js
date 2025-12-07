/**
 * Script to restore TEST DRIVE A VEHICLE category and remove the simple Visit onsite
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function restoreTestDrive() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('offers');

    // Delete the simple "Visit onsite" category
    const deleteResult = await collection.deleteOne({
      name: "VISIT ONSITE",
      offers: ["Visit onsite"]
    });

    if (deleteResult.deletedCount > 0) {
      console.log('✅ Deleted simple "VISIT ONSITE" category');
    }

    // Restore the original TEST DRIVE A VEHICLE category
    const insertResult = await collection.insertOne({
      name: "TEST DRIVE A VEHICLE",
      icon: "🚗",
      description: "Test drive our vehicles",
      offers: ["Trucks", "Tractors", "Vans", "Other Units"],
      color: "green"
    });

    console.log('✅ Restored "TEST DRIVE A VEHICLE" category');
    console.log(`   Document ID: ${insertResult.insertedId}`);

    console.log('\n✅ Restore complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

restoreTestDrive();
