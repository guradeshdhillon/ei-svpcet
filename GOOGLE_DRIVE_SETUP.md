# Google Drive Gallery Integration Setup

## Overview
The gallery now dynamically loads images from your Google Drive folder. It includes fallback support and optimized loading for better performance.

## Features
- ✅ Dynamic loading from Google Drive folder
- ✅ Fast preview with first 20 images/videos
- ✅ Optimized loading (eager loading for first 8 items)
- ✅ Loading animations and skeleton states
- ✅ Fallback data when API is unavailable
- ✅ 5-minute caching for better performance
- ✅ Support for both images and videos

## Setup Instructions

### 1. Get Google Drive API Key
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API
4. Create credentials (API Key)
5. Restrict the API key to Google Drive API only

### 2. Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your API key to `.env`:
   ```
   VITE_GOOGLE_DRIVE_API_KEY=your_actual_api_key_here
   ```

### 3. Make Google Drive Folder Public
1. Open your Google Drive folder: https://drive.google.com/drive/folders/1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o
2. Right-click → Share
3. Change access to "Anyone with the link can view"
4. Ensure all images/videos in the folder are also publicly accessible

### 4. Test the Integration
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate to the Gallery section
3. Images should load dynamically from your Google Drive folder

## How It Works

### Dynamic Loading
- The `GoogleDriveService` fetches files from your specified folder
- First 20 items are loaded by default
- Results are cached for 5 minutes to improve performance

### Fallback System
- If API key is missing or API fails, it uses predefined fallback images
- Ensures gallery always works even without API configuration

### Performance Optimizations
- First 8 images use `eager` loading for instant preview
- Remaining images use `lazy` loading
- Staggered animation delays for smooth appearance
- Loading skeletons while images load

### File Support
- **Images**: JPG, PNG, GIF, WebP, etc.
- **Videos**: MP4, MOV, AVI, etc.
- Automatically detects file type from MIME type

## Folder Structure
```
src/
├── services/
│   └── googleDriveService.ts    # Google Drive API integration
├── components/
│   └── Gallery3D.tsx           # Updated gallery component
└── ...
```

## Troubleshooting

### Images Not Loading
1. Check if API key is correctly set in `.env`
2. Verify Google Drive folder is public
3. Check browser console for API errors
4. Ensure Google Drive API is enabled in Google Cloud Console

### API Quota Exceeded
- The service includes caching to minimize API calls
- Consider implementing additional caching strategies if needed

### Fallback Mode
- If you see the same 20 images always, you're in fallback mode
- This means either no API key is set or API calls are failing

## Adding New Images
Simply upload new images/videos to your Google Drive folder. They will appear in the gallery within 5 minutes (cache refresh time) or immediately after a page refresh.

## Customization
- Change `limit` in `getMediaItems(20)` to load more/fewer items
- Modify `CACHE_DURATION` in the service for different cache times
- Update fallback images in `getFallbackData()` method