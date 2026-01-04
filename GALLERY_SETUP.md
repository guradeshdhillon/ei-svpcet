# Gallery Setup Guide

## How the Gallery Works

The gallery automatically displays images from your Google Drive folder without requiring any API credentials. It shows 20 images initially and provides a "Load More" button to display additional images.

## Current Setup

- **Folder ID**: `1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o`
- **Folder URL**: https://drive.google.com/drive/folders/1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o
- **Display**: Shows 20 images initially, load more in batches of 20

## Adding New Images

To add new images to the gallery:

1. **Upload to Google Drive Folder**
   - Open the folder: https://drive.google.com/drive/folders/1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o
   - Upload your images/videos to this folder
   - Make sure the folder is set to "Anyone with the link can view"

2. **Get File IDs**
   - Right-click on each uploaded image
   - Select "Get link" 
   - Copy the file ID from the URL (the long string after `/d/` and before `/view`)
   - Example: `https://drive.google.com/file/d/1ABC123DEF456/view` → ID is `1ABC123DEF456`

3. **Update the Code**
   - Open `src/services/googleDriveService.ts`
   - Add the new file IDs to the `realFileIds` array in the `getFallbackData()` method
   - Save the file

## File Format

The gallery supports:
- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, MOV

## Image URLs

The system automatically generates these URLs for each file ID:
- **Thumbnail**: `https://lh3.googleusercontent.com/d/{FILE_ID}=w400`
- **Full Size**: `https://lh3.googleusercontent.com/d/{FILE_ID}=w1024`

## Features

- ✅ No API credentials required
- ✅ Automatic image loading
- ✅ Load more functionality (20 items per batch)
- ✅ Image and video support
- ✅ Responsive grid layout
- ✅ Modal view for full-size images
- ✅ Loading states and error handling

## Troubleshooting

If images don't load:
1. Check that the Google Drive folder is public
2. Verify the file IDs are correct
3. Ensure images are in a supported format
4. Check browser console for errors

## Future Enhancements

To make it fully automatic (without manual file ID updates):
1. Set up a backend service to scrape the public folder
2. Use Google Drive API with proper authentication
3. Implement automatic file discovery