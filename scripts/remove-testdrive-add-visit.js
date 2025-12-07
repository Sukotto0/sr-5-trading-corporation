/**
 * Script to remove TEST DRIVE A VEHICLE category and add Visit onsite option
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function updateServiceOffers() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('offers');

    // Delete the "VISIT ONSITE" category (previously TEST DRIVE A VEHICLE)
    const deleteResult = await collection.deleteOne({
      name: "VISIT ONSITE"
    });

    if (deleteResult.deletedCount > 0) {
      console.log('✅ Deleted "VISIT ONSITE" category');
    } else {
      console.log('⚠️  "VISIT ONSITE" category not found, trying "TEST DRIVE A VEHICLE"');
      const deleteResult2 = await collection.deleteOne({
        name: "TEST DRIVE A VEHICLE"
      });
      if (deleteResult2.deletedCount > 0) {
        console.log('✅ Deleted "TEST DRIVE A VEHICLE" category');
      }
    }

    // Create a new simple "Visit onsite" option
    const insertResult = await collection.insertOne({
      name: "VISIT ONSITE",
      icon: "🏢",
      description: "Schedule an onsite visit to our location",
      offers: ["Visit onsite"],
      color: "blue"
    });

    console.log('✅ Added new "VISIT ONSITE" category with single "Visit onsite" option');
    console.log(`   Document ID: ${insertResult.insertedId}`);

    console.log('\n✅ Update complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateServiceOffers();
