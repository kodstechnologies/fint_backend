// src/seeders/user.seeder.js
import { User } from '../models/user.model.js';

export default async function seedUserData() {
  try {
    const userEmail = 'userr@gmail.com';

    const existingUser = await User.findOne({ email: userEmail });

    if (existingUser) {
      console.log('ℹ️ User already exists');
      return;
    }

    const userData = {
      name: 'User',
      phoneNumber: '9999988886',
      email: userEmail,
      bloodGroup: 'B+',
      pinCode: '756100',
    };

    await User.create(userData);
    console.log('✅ User created in "users" collection');
  } catch (error) {
    console.error('❌ Error seeding user data:', error);
  }
}
