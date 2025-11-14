// PENTING: Import dari 'firebase/database', BUKAN 'firebase/firestore'
import { ref, get } from "firebase/database";
import { db } from "../config/firebase";

/**
 * Mengambil data user dari Realtime Database
 */
export const fetchUserData = async (uid) => {
  if (!uid) return null;

  try {
    // PENTING: Gunakan ref(), bukan doc()
    const userRef = ref(db, "users/" + uid);

    // PENTING: Gunakan get(), bukan getDoc()
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // PENTING: Gunakan .val() untuk mengambil data di RTDB
      return snapshot.val();
    } else {
      console.warn(`User tidak ditemukan di RTDB untuk UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Gagal mengambil data user (RTDB):", error);
    return null;
  }
};
