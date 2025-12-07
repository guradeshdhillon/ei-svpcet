import React from 'react';

export default function ContactPage() {
  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800 dark:text-gray-100">Get In Touch</h2>
        {/* Team Member Task: Use v0 to generate a form component and a sidebar for contact info.
          Focus on: Input validation and clear submission feedback.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-semibold mb-5">Send Us a Message</h3>
            {/* Placeholder for Contact Form (to be replaced by v0 code) */}
            <p>Form Placeholder Area</p>
          </div>
          <div className="space-y-6">
            {/* Placeholder for Contact Info (Email, Phone, Location) */}
            <p>Email: example@svpcet.com</p>
            <p>Location: SVPCET Campus</p>
            {/* You can add a map embed here */}
          </div>
        </div>
      </div>
    </section>
  );
}
