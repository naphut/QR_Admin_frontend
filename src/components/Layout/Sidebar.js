import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', to: '/admin', icon: HomeIcon },
    { name: 'Products', to: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders', to: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Users', to: '/admin/users', icon: UsersIcon },
    { name: 'Analytics', to: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">ROUTINE Admin</h1>
        <p className="text-sm text-gray-400 mt-1">E-commerce Dashboard</p>
      </div>
      <nav className="mt-6">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition ${
                isActive ? 'bg-gray-800 text-white border-r-4 border-white' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;