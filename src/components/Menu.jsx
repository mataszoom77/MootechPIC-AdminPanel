import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Products', path: '/products' },
  { name: 'Orders', path: '/orders' },
  { name: 'Requests', path: '/requests' },
];

export default function Menu() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 shadow-md flex flex-col">
      <div className="px-6 py-4 overflow-y-auto flex-1">
        <h1 className="text-2xl font-bold text-moogreen mb-8">MootechPIC</h1>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded text-sm font-medium ${
                  isActive
                    ? 'bg-[--color-moogreen]/10 text-moogreen'
                    : 'text-gray-800 hover:bg-gray-100'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-6 py-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
