import React from "react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white text-gray-900">
    {children}
  </div>
);
