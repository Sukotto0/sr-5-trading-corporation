/**
 * Script to update service offers in the database
 * This replaces "Test Drive a Vehicle" with "Visit onsite"
 * 
 * Usage: node scripts/update-service-offers.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

async function updateServiceOffers() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Make sure you have a .env.local file with MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('main');
    const collection = db.collection('offers');

    // Find the "TEST DRIVE A VEHICLE" category
    const testDriveCategory = await collection.findOne({
      name: "TEST DRIVE A VEHICLE"
    });

    if (!testDriveCategory) {
      console.log('⚠️  "TEST DRIVE A VEHICLE" category not found');
      return;
    }

    console.log(`Found category: ${testDriveCategory.name}`);
    console.log(`Current offers: ${testDriveCategory.offers.join(', ')}`);

    // Update the category name to "Visit onsite"
    const result = await collection.updateOne(
      { _id: testDriveCategory._id },
      { $set: { name: "VISIT ONSITE" } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully changed "TEST DRIVE A VEHICLE" to "VISIT ONSITE"');
    } else {
      console.log('⚠️  No changes made');
    }

    console.log('\n✅ Update complete');

  } catch (error) {
    console.error('❌ Error updating service offers:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateServiceOffers();
