import * as admin from "firebase-admin";

let config = process.env.OH_FIREBASE_ADMIN_CONFIG;
if(!config) {
  throw new Error("Env variable OH_FIREBASE_ADMIN_CONFIG missing!");
}
var serviceAccount = JSON.parse(config);

export let app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});