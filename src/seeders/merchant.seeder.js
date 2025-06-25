// src/seeders/merchant.seeder.js
import { Merchant } from '../models/merchant.model.js';

export default async function seedMerchantData() {
  try {
    const merchantEmail = 'merchant@gmail.com';

    const existingMerchant = await Merchant.findOne({ email: merchantEmail });

    if (existingMerchant) {
      console.log('ℹ️ Merchant user already exists');
      return;
    }

    const merchantData = {
      firstName: 'Merchant',
      lastName: 'One',
      phoneNumber: '9999988887',
      email: merchantEmail,
      bloodGroup: 'A+',
      pinCode: '756100',
    };

    await Merchant.create(merchantData);
    console.log('✅ Merchant user created in "merchants" collection');
  } catch (error) {
    console.error('❌ Error seeding merchant data:', error);
  }
}
