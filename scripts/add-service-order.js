/**
 * Script to add order field to services for proper display ordering
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function addOrderField() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('offers');

    // Define the desired order
    const orderMapping = {
      'TEST DRIVE A VEHICLE': 1,
      'UPHOLSTERY': 2,
      'AIRCONDITIONING': 3,
      'TINSMITH SERVICES': 4,
      'PAINTING SERVICES': 5,
      'MECHANIC SERVICES': 6
    };

    // Update each service with its order
    for (const [name, order] of Object.entries(orderMapping)) {
      const result = await collection.updateOne(
        { name: name },
        { $set: { order: order } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Set order ${order} for "${name}"`);
      } else {
        console.log(`⚠️  "${name}" not found or already has order ${order}`);
      }
    }

    console.log('\n✅ Order fields added successfully');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

addOrderField();
