/**
 * lib/firebase-admin.ts
 *
 * Server-only Firebase Admin SDK init. Distinct from lib/firebase.ts
 * (client SDK, used for Google/phone Auth) — never import this from
 * client components.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY missing — check .env.local");
  }

  const serviceAccount = JSON.parse(raw);
  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}