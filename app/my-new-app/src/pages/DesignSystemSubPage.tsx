import React from 'react';

interface DesignSystemSubPageProps {
  title: string;
}

const DesignSystemSubPage: React.FC<DesignSystemSubPageProps> = ({ title }) => {
  return (
    <div className="p-4 bg-purple-100 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-800">{title}</h1>
      <p className="mt-2 text-purple-700">Content for the {title.toLowerCase()} section of the design system.</p>
    </div>
  );
};

export default DesignSystemSubPage;
