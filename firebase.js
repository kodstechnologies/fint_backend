import admin from "firebase-admin";
import { serviceAccount } from "./fint-ca571-firebase-adminsdk-fbsvc-9fe7cd9b4e.js";

// const serviceAccount = require("./art-of-living-1b75a-firebase-adminsdk-fbsvc-a08df784cc");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
