# Firebase Setup Guide

This project uses Firebase for Authentication, Firestore (streams and papers), and Storage (PDF uploads). Follow these steps to set up Firebase for your project:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name and continue
4. Enable or disable Google Analytics (optional) and continue
5. Select or create a Google Analytics account (if enabled) and continue
# Firebase Setup Guide

This project uses Firebase for **Authentication**, **Firestore** (database for streams and papers), and **Storage** (for PDF file uploads). Follow these steps to set up Firebase for your project.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "smart-pyq") and continue
4. Enable or disable Google Analytics (optional) and continue
5. Select or create a Google Analytics account (if enabled) and continue
6. Click "Create project"

## 2. Register Your Web App

1. In the Firebase Console, click the settings gear icon and select "Project settings"
2. In the "Your apps" section, click the web icon (</>) to register a new web app
3. Enter a nickname for your app (e.g., "SmartPYQ Web") and click "Register app"
4. Copy the Firebase configuration object that appears - you'll need these values for your `.env` file

## 3. Enable Authentication

1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click the "Sign-in method" tab
4. Enable "Email/Password" sign-in provider
5. Click "Save"

## 4. Enable Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode"
4. Select a Cloud Firestore location (choose one close to your users)
5. Click "Enable"

**Firestore Structure:**
The app uses two collections:
- `streams` - Contains exam streams (e.g., NEET, JEE, Diploma)
  - Fields: `name` (string), `created_at` (timestamp string)
- `papers` - Contains question papers
  - Fields: `title` (string), `stream_id` (string), `subject` (string), `year` (number), `file_url` (string), `file_path` (string), `created_at` (timestamp string)

## 5. Enable Cloud Storage

1. In the Firebase Console, click "Storage" in the left sidebar
2. Click "Get started"
3. Review the security rules and click "Next"
4. Select a Cloud Storage location (same as Firestore)
5. Click "Done"

**Storage Structure:**
PDFs are uploaded to: `papers/{stream_id}/{timestamp}_{filename}.pdf`

## 6. Configure Environment Variables

Create a `.env` file in your project root and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Important Notes:**
- All variables must be prefixed with `VITE_` for Vite to expose them
- The `VITE_FIREBASE_STORAGE_BUCKET` should be `<project-id>.appspot.com` (NOT `*.firebasestorage.app`) to avoid CORS issues during uploads

## 7. Set Up Firestore Security Rules (Optional but Recommended)

For development, you can use these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all documents
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to write to streams and papers
    match /streams/{streamId} {
      allow write: if request.auth != null;
    }
    
    match /papers/{paperId} {
      allow write: if request.auth != null;
    }
  }
}
```

## 8. Set Up Storage Security Rules (Optional but Recommended)

For development, you can use these basic rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /papers/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 9. Create Admin User

To access the admin panel:

1. Run your application: `npm run dev`
2. Navigate to `/admin` in your browser
3. Click "Need an account? Sign Up"
4. Create your admin account with email and password
5. Sign in to access the admin panel

**Note:** Currently, the admin panel requires authentication but doesn't restrict access by role. In production, you should implement proper role-based access control.

## 10. Admin Panel Features

Once logged in to `/admin`, you can:

### Manage Streams Tab
- Add new exam streams (e.g., NEET, JEE, Diploma)
- Delete existing streams (this will also delete associated papers)

### Upload Papers Tab
- Upload new question papers (PDF only)
- Fill in paper details: title, stream, subject, year
- Files are automatically uploaded to Firebase Storage

### View Papers Tab
- See all uploaded papers
- View, download, or delete papers
- Papers are organized by stream

## 11. How It Works

- **Admin Panel** (`/admin`): Upload and manage papers via Firebase Auth, Firestore, and Storage
- **Repository** (`/repository`): View and download papers - automatically fetches from Firestore if configured, otherwise shows mock data
- **Data Flow**: Admin uploads → Firebase Storage (PDF) + Firestore (metadata) → Repository displays live data

## Troubleshooting

### CORS Errors During Upload
- Ensure `VITE_FIREBASE_STORAGE_BUCKET` is set to `<project-id>.appspot.com` (not `*.firebasestorage.app`)
- The Firebase SDK handles CORS automatically when the bucket is correct

### "Invalid Login Credentials"
- Verify your email and password are correct
- Sign up first if you haven't created an account yet
- Check Firebase Console → Authentication → Users to see registered users

### Papers Not Showing in Repository
- Check Firebase Console → Firestore Database to verify papers were uploaded
- Open browser console to see any error messages
- Ensure your Firestore security rules allow read access

### Environment Variables Not Loading
- Verify all variables are prefixed with `VITE_`
- Restart the dev server after changing `.env`
- Check that `.env` is in the project root (not in `src/`)

## Next Steps

After setup:
1. Add your first stream (e.g., "NEET", "JEE Main")
2. Upload sample question papers
3. Visit the Repository page to see your papers
4. Configure production security rules before deploying
## Notes

- Admin Panel: lets you create streams, upload PDFs, list, and delete papers. Uploads use Firebase Storage via the Web SDK—no custom CORS configuration is required if the bucket is correct. If you see preflight/CORS errors, verify that `VITE_FIREBASE_STORAGE_BUCKET` is `<project-id>.appspot.com`.
- Repository Page: attempts to load papers from Firestore (if configured); otherwise it falls back to mock data bundled in the app.
- Paper Dashboard: uses Supabase if configured, which is separate from Firebase. You may consolidate to one backend by removing Supabase usage or migrating data accordingly.