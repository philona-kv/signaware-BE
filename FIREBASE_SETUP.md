# Firebase Authentication Setup

This guide will help you set up Firebase Authentication for the SignAware backend.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "signaware")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create project"

## 2. Enable Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Click on **Google** provider
5. Enable it and configure:
   - **Project support email**: Your email
   - **Project public-facing name**: Your app name
6. Click **Save**

## 3. Get Service Account Credentials

1. In Firebase Console, go to **Project settings** (gear icon)
2. Go to the **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. **Important**: Keep this file secure and never commit it to version control

## 4. Configure Environment Variables

Add these to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### How to get these values:

- **FIREBASE_PROJECT_ID**: Found in your Firebase project settings
- **FIREBASE_CLIENT_EMAIL**: From the downloaded service account JSON file
- **FIREBASE_PRIVATE_KEY**: From the downloaded service account JSON file (copy the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)

## 5. Frontend Integration

On your frontend, you'll need to:

1. Install Firebase SDK:
   ```bash
   npm install firebase
   ```

2. Initialize Firebase:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   ```

3. Sign in with Google:
   ```javascript
   const provider = new GoogleAuthProvider();
   const result = await signInWithPopup(auth, provider);
   const idToken = await result.user.getIdToken();
   
   // Send token to your backend
   const response = await fetch('/api/v1/auth/google', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ token: idToken })
   });
   ```

## 6. Security Rules

Make sure your Firebase project has appropriate security rules. For development, you can start with:

```javascript
// Firestore rules (if using Firestore)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Testing

1. Start your backend server
2. Test the authentication endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/google \
     -H "Content-Type: application/json" \
     -d '{"token": "your-firebase-id-token"}'
   ```

## Troubleshooting

### Common Issues:

1. **Invalid private key format**: Make sure the private key includes the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
2. **Project ID mismatch**: Ensure the project ID in your environment variables matches your Firebase project
3. **Service account permissions**: Make sure your service account has the necessary permissions

### Error Messages:

- `Invalid Firebase token`: The ID token is invalid or expired
- `Firebase auth error`: Check your Firebase configuration and service account credentials

## Security Best Practices

1. **Never commit service account keys** to version control
2. **Use environment variables** for all Firebase credentials
3. **Rotate service account keys** regularly
4. **Set up proper Firebase security rules**
5. **Monitor authentication logs** in Firebase Console

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Security Rules](https://firebase.google.com/docs/rules) 