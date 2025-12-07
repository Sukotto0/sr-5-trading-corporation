/**
 * Script to view all service offers in the database
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function viewServiceOffers() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('main');
    const collection = db.collection('offers');

    const allOffers = await collection.find({}).toArray();

    console.log(`Found ${allOffers.length} service categories:\n`);

    allOffers.forEach((offer, index) => {
      console.log(`${index + 1}. ${offer.name}`);
      console.log(`   Icon: ${offer.icon}`);
      console.log(`   Offers:`);
      offer.offers.forEach(item => {
        console.log(`     - ${item}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

viewServiceOffers();
