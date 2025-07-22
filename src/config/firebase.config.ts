import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseConfig {
  constructor(private configService: ConfigService) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      const serviceAccountPath = path.join(process.cwd(), 'signaware-3ef1b-firebase-adminsdk-fbsvc-8dfe23973c.json');
      
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        console.error('❌ Firebase Admin SDK initialization failed:', error);
        // Fallback to environment variables if file doesn't exist
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this.configService.get('FIREBASE_PROJECT_ID'),
            clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
          }),
        });
      }
    }
  }

  getAuth() {
    return admin.auth();
  }
} 