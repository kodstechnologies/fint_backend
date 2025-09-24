import admin from "firebase-admin";
import { serviceAccount } from "./fint-4f4f4-firebase-adminsdk-fbsvc-a497040422.js";

// const serviceAccount = require("./art-of-living-1b75a-firebase-adminsdk-fbsvc-a08df784cc");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
