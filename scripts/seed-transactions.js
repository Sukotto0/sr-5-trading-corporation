const { MongoClient } = require('mongodb');

// Sample transaction data matching your schema
const sampleTransactions = [
  {
    _id: "674c4f5e123456789abcdef1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+63 912 345 6789",
    productName: "Heavy Duty Truck",
    productId: "prod_001",
    toPay: "250000",
    productPrice: "300000",
    appointment: "2024-12-15T09:00:00.000Z",
    createdAt: "2024-11-20T10:30:00.000Z",
    lastUpdated: "2024-11-20T10:30:00.000Z",
    status: "success",
    paymentId: "pay_success_001",
    userId: "user_001"
  },
  {
    _id: "674c4f5e123456789abcdef2", 
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@email.com",
    phone: "+63 923 456 7890",
    productName: "Construction Equipment",
    productId: "prod_002",
    toPay: "180000",
    productPrice: "200000", 
    appointment: "2024-12-16T14:00:00.000Z",
    createdAt: "2024-11-21T15:45:00.000Z",
    lastUpdated: "2024-11-21T15:45:00.000Z",
    status: "failed",
    paymentId: "pay_failed_002",
    userId: "user_002"
  },
  {
    _id: "674c4f5e123456789abcdef3",
    firstName: "Carlos",
    lastName: "Reyes", 
    email: "carlos.reyes@email.com",
    phone: "+63 934 567 8901",
    productName: "Engine Parts",
    productId: "prod_003",
    toPay: "45000",
    productPrice: "50000",
    appointment: "2024-12-17T11:30:00.000Z",
    createdAt: "2024-11-22T08:20:00.000Z",
    lastUpdated: "2024-11-22T08:20:00.000Z", 
    status: "cancelled",
    paymentId: "pay_cancelled_003",
    userId: "user_003"
  },
  {
    _id: "674c4f5e123456789abcdef4",
    firstName: "Ana",
    lastName: "Garcia",
    email: "ana.garcia@email.com", 
    phone: "+63 945 678 9012",
    productName: "Spare Tools",
    productId: "prod_004",
    toPay: "75000",
    productPrice: "80000",
    appointment: "2024-12-18T13:15:00.000Z",
    createdAt: "2024-11-23T12:10:00.000Z",
    lastUpdated: "2024-11-23T12:10:00.000Z",
    status: "success",
    paymentId: "pay_success_004",
    userId: "user_004"
  },
  {
    _id: "674c4f5e123456789abcdef5",
    firstName: "Roberto",
    lastName: "Cruz",
    email: "roberto.cruz@email.com",
    phone: "+63 956 789 0123", 
    productName: "Heavy Machinery",
    productId: "prod_005",
    toPay: "850000",
    productPrice: "900000",
    appointment: "2024-12-19T16:45:00.000Z",
    createdAt: "2024-11-24T09:55:00.000Z",
    lastUpdated: "2024-11-24T09:55:00.000Z",
    status: "success", 
    paymentId: "pay_success_005",
    userId: "user_005"
  }
];

async function seedTransactions() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('main');
    
    // Clear existing transactions (if any)
    await db.collection('transactions').deleteMany({});
    console.log('Cleared existing transactions');
    
    // Insert sample transactions
    const result = await db.collection('transactions').insertMany(sampleTransactions);
    console.log(`Inserted ${result.insertedCount} sample transactions`);
    
    // Verify the data
    const count = await db.collection('transactions').countDocuments();
    console.log(`Total transactions in database: ${count}`);
    
    const statuses = await db.collection('transactions').distinct('status');
    console.log('Status values in database:', statuses);
    
    await client.close();
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedTransactions();