// src/seeders/admin.seeder.js
import { Admin } from '../models/admin.model.js';

export default async function seedAdminData() {
  try {
    const adminEmail = 'admin@gmail.com';

    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      return;
    }

    const adminData = {
      firstName: 'Admin',
      lastName: 'One',
      phoneNumber: '9999988888',
      email: adminEmail,
      bloodGroup: 'O+',
      pinCode: '756100',
      password: 'fint@1234', // Will be hashed via pre-save middleware
    };

    await Admin.create(adminData);
    console.log('✅ Admin user created in "admins" collection');
  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  }
}
