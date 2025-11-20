# SmartPYQ Admin Panel Setup Guide

## 🚀 Quick Setup Instructions

### 1. Supabase Configuration

Before using the admin panel, you need to set up your Supabase project:

#### Database Setup
1. The migration file `supabase/migrations/create_pyq_papers_table.sql` has been created
2. This will create:
   - `pyq_papers` table with proper schema
   - Storage bucket `pyq-papers` for PDF files
   - Row Level Security policies
   - Public read access for papers

#### Get Your Supabase Credentials
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy your:
   - Project URL
   - Anon/Public Key

#### Update Admin Panel
1. Open `admin.html`
2. Find these lines (around line 200):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace with your actual Supabase credentials

### 2. Create Admin Account

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Add User"
4. Create your admin account with email and password
5. This will be your login for the admin panel

### 3. Storage Setup

The migration automatically creates the storage bucket, but verify:
1. Go to Storage in your Supabase dashboard
2. Ensure `pyq-papers` bucket exists
3. Check that it's set to public (for file access)

### 4. Using the Admin Panel

1. Open `admin.html` in your browser
2. Sign in with your admin credentials
3. Fill out the form:
   - **Exam Type**: Select from dropdown (JEE, NEET, CBSE, etc.)
   - **Subject**: Select subject (Physics, Chemistry, Math, etc.)
   - **Year**: Enter the year (2000-2030)
   - **PDF File**: Upload PDF only (drag & drop supported)
4. Click "Upload PYQ Paper"

### 5. Features

✅ **Secure Authentication**: Only admin can access upload form
✅ **File Validation**: PDF files only
✅ **Drag & Drop**: Easy file upload
✅ **Responsive Design**: Works on mobile and desktop
✅ **Real-time Feedback**: Success/error messages
✅ **Auto-generated URLs**: Files get public URLs automatically
✅ **Database Integration**: Metadata stored in PostgreSQL

### 6. File Structure

```
admin.html                          # Complete admin panel (single file)
supabase/migrations/               # Database migrations
├── create_pyq_papers_table.sql   # Creates tables and storage
README-Admin.md                    # This setup guide
```

### 7. Database Schema

The `pyq_papers` table contains:
- `id` (UUID, primary key)
- `exam_type` (text)
- `subject` (text) 
- `year` (integer)
- `file_url` (text, public URL)
- `uploaded_at` (timestamp, auto-generated)

### 8. Security Notes

- Row Level Security (RLS) is enabled
- Only authenticated users can upload
- Public can read/download papers
- Files are stored in public bucket for easy access
- Admin authentication required for all uploads

### 9. Troubleshooting

**Login Issues:**
- Verify your admin account exists in Supabase Auth
- Check Supabase URL and keys are correct
- Ensure email confirmation is disabled (or confirm email)

**Upload Issues:**
- Check storage bucket exists and is public
- Verify RLS policies are set correctly
- Ensure file is PDF format only
- Check browser console for detailed errors

**File Access Issues:**
- Verify storage bucket is public
- Check file URLs are generated correctly
- Ensure storage policies allow public read

### 10. Next Steps

After setup, you can:
1. Start uploading PYQ papers through the admin panel
2. Papers will be automatically available in your main SmartPYQ app
3. Monitor uploads through Supabase dashboard
4. Add more exam types/subjects as needed

---

🎉 **Your SmartPYQ Admin Panel is ready to use!**

For support, check the browser console for any error messages and verify your Supabase configuration.