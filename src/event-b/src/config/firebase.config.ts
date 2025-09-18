import * as admin from "firebase-admin";
import { join } from "path";

// Đọc file JSON chứa khóa Firebase Admin SDK
const serviceAccount = require(join(__dirname, "firebase-adminsdk.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`, // Lấy project ID từ JSON
});

// Xuất Firebase để dùng ở các service khác
export const bucket = admin.storage().bucket();
export default admin;
