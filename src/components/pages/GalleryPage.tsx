import React from 'react';

export default function GalleryPage() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800 dark:text-gray-100">Project & Event Gallery</h2>
        {/* Team Member Task: Use v0 to generate a Masonry or Photo Grid component.
          Focus on: Responsive design for high-resolution images.
        */}
        <div className="columns-1 sm:columns-2 lg:columns-3 space-y-4">
          {/* Placeholder for Gallery Images (to be replaced by v0 output) */}
          <div className="w-full bg-gray-200 h-40 rounded-lg">Image Placeholder 1</div>
          <div className="w-full bg-gray-200 h-64 rounded-lg">Image Placeholder 2</div>
        </div>
      </div>
    </section>
  );
}
