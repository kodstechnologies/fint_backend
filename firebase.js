import admin from "firebase-admin";
import { userServiceAccount } from "./fint-4f4f4-firebase-adminsdk-fbsvc-a497040422.js";
import { ventureServiceAccount } from "./fintventures-firebase-adminsdk-fbsvc-a12752167e.js";

// ✅ Default App (Fint Project)
const fintApp = admin.initializeApp({
  credential: admin.credential.cert(userServiceAccount),
});

// ✅ Named App (Fint Ventures Project)
const fintVenturesApp = admin.initializeApp(
  {
    credential: admin.credential.cert(ventureServiceAccount),
  },
  "fintVentures" // custom app name
);

// Export both apps if you need them separately
export { fintApp, fintVenturesApp };
