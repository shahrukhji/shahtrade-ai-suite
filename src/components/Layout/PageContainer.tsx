import React from 'react';

const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pt-[80px] pb-[140px] px-4 max-w-[430px] mx-auto min-h-screen overflow-y-auto">
    {children}
  </div>
);

export default PageContainer;
