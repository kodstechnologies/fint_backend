import { Admin } from "../models/admin.model.js";
import config from "../config/index.js";
const { ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_PHONE_NO, ADMIN_EMAIL, ADMIN_BLOOD_GROUP, ADMIN_PINCODE, ADMIN_PASSWORD, ADMIN_ADDRESS } = config;
export default async function seedAdminData() {
  try {
    const adminEmail = ADMIN_EMAIL;

    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      return;
    }

    const adminData = {
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      phoneNumber: ADMIN_PHONE_NO,
      email: adminEmail,
      bloodGroup: ADMIN_BLOOD_GROUP,
      pinCode: ADMIN_PINCODE,
      password: ADMIN_PASSWORD, // 🔐 auto-hashed
      address: ADMIN_ADDRESS,
    };

    await Admin.create(adminData);

    console.log("🚀 Default admin created successfully");
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
  }
};
