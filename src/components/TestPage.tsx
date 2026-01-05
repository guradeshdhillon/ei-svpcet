import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Engineering India SVPCET
        </h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Gallery Test Page
          </p>
          <div className="bg-blue-100 p-4 rounded-lg">
            <p>If you can see this, the app is loading correctly!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;