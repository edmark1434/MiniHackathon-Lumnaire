import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Initialize Firebase Admin SDK
// Priority: GOOGLE_APPLICATION_CREDENTIALS env var -> serviceAccountKey.json file -> default credentials
let credential;

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  resolve(process.cwd(), "serviceAccountKey.json");

if (existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  credential = admin.credential.cert(serviceAccount);
  console.log("✅ Firebase Admin: Using service account from", serviceAccountPath);
} else {
  console.warn("⚠️  Firebase Admin: serviceAccountKey.json not found at", serviceAccountPath);
  console.warn("   Falling back to Application Default Credentials.");
  console.warn("   Download your service account key from:");
  console.warn("   https://console.firebase.google.com/project/mini-hackathon-cf22c/settings/serviceaccounts/adminsdk");
  credential = admin.credential.applicationDefault();
}

const app = admin.initializeApp({
  credential,
  projectId: "mini-hackathon-cf22c",
});

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
export default app;
