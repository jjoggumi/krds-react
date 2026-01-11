import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { ProfilePage, ProjectPage, DesignSystemPage, DesignSystemSubPage } from './pages'; // Will create these soon

// Placeholder for GNB Component
const GNB: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <ul className="flex space-x-4">
        <li>
          <Link to="/profile" className="hover:text-gray-300">Profile</Link>
        </li>
        <li>
          <Link to="/project" className="hover:text-gray-300">Project</Link>
        </li>
        <li>
          <Link to="/design-system" className="hover:text-gray-300">Design System</Link>
        </li>
      </ul>
    </nav>
  );
};

// Placeholder for LNB Component (specific to Design System)
const LNB: React.FC = () => {
  return (
    <nav className="bg-gray-200 p-4 w-48 flex-shrink-0">
      <h3 className="font-bold mb-2">Design System Sub-Menus</h3>
      <ul>
        <li>
          <Link to="/design-system/components" className="block py-1 hover:bg-gray-300">Components</Link>
        </li>
        <li>
          <Link to="/design-system/patterns" className="block py-1 hover:bg-gray-300">Patterns</Link>
        </li>
        <li>
          <Link to="/design-system/foundations" className="block py-1 hover:bg-gray-300">Foundations</Link>
        </li>
      </ul>
    </nav>
  );
};

// Layout for pages with LNB (e.g., Design System)
const LayoutWithLNB: React.FC = () => (
  <div className="flex">
    <LNB />
    <div className="flex-grow p-4">
      <Outlet /> {/* Renders the matched sub-route */}
    </div>
  </div>
);

// Main Application Component
const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <GNB />
        <main className="flex-grow">
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/design-system" element={<LayoutWithLNB />}>
              <Route index element={<DesignSystemPage />} /> {/* Default content for /design-system */}
              <Route path="components" element={<DesignSystemSubPage title="Components" />} />
              <Route path="patterns" element={<DesignSystemSubPage title="Patterns" />} />
              <Route path="foundations" element={<DesignSystemSubPage title="Foundations" />} />
            </Route>
            {/* Redirect to /profile as default */}
            <Route path="/" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
