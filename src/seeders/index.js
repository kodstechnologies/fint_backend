// src/seeders/index.js
import dotenv from 'dotenv';
import connectDB from '../database/index.js';
import seedAdminData from './admin.seeder.js';
// import seedMerchantData from './merchant.seeder.js'; // ✅ fixed typo
// import seedUserData from './user.seeder.js';

dotenv.config({ path: './.env' });

async function seedAllData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected!');

    await seedAdminData();
    // await seedMerchantData();
    // await seedUserData();

    console.log('🌱 Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seedAllData();
