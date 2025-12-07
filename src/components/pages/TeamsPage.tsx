import React from 'react';

export default function TeamsPage() {
  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800 dark:text-gray-100">Our Core Team</h2>
        {/* Team Member Task: Use v0 to generate a visually appealing 'Team Grid' or 'Team Carousel'.
          Focus on: Consistent card design for photos, names, and roles.
          
          Example Prompt: "A professional and modern grid of team member cards with circular photos, names, and titles."
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Placeholder for Team Member Cards (to be replaced by v0 output) */}
          <div className="text-center">Member Card 1</div>
          <div className="text-center">Member Card 2</div>
        </div>
      </div>
    </section>
  );
}
