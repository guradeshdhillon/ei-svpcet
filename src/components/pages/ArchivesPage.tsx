import React from 'react';

export default function ArchivesPage() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800 dark:text-gray-100">Event Archives</h2>
        {/* Team Member Task: Use v0 to generate a component that displays past events.
          Focus on: Filter/Search bar and a grid/list of 'Archive Card' components.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for Archive Cards (to be replaced by v0 output) */}
          <div className="p-4 border rounded-lg">Archived Event 1</div>
          <div className="p-4 border rounded-lg">Archived Event 2</div>
          <div className="p-4 border rounded-lg">Archived Event 3</div>
        </div>
      </div>
    </section>
  );
}
