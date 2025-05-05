import Menu from './Menu';

export default function Layout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Menu />

      {/* Main Content */}
      <div className="ml-64 w-full min-h-screen bg-gray-50 p-6">
        {children}
      </div>
    </div>
  );
}
