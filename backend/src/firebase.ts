import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from 'dotenv';

// load environment variables from .env
dotenv.config();

if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('[FIRESTORE] Using emulator at:', process.env.FIRESTORE_EMULATOR_HOST);
} else {
    console.warn('[FIRESTORE] NOT FOUND');
}

// use project ID
const app = initializeApp ({
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'demo-user-dashboard',
});

export const db = getFirestore(app);
    