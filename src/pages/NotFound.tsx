
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">TeachnGrow</h1>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-2xl mb-8">Page not found</p>
          
          <Link
            to="/"
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-md"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
