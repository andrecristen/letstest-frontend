import React, { useEffect, useState } from 'react';
import { FiMenu, FiBell, FiUser, FiGitPullRequest, FiPlay, FiSearch, FiPieChart } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-transparente.png';

interface Menu {
  name: string;
  route: string;
  icon: JSX.Element;
}

interface PainelNavbarProps {
  children: React.ReactNode;
}

const PainelNavbar: React.FC<PainelNavbarProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(
    localStorage.getItem('isMenuOpen') === 'true'
  );
  const [menuSelected, setMenuSelected] = useState(location.pathname);

  const toggleMenu = () => {
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    localStorage.setItem('isMenuOpen', `${newIsMenuOpen}`);
  };

  const menus: Menu[] = [
    { name: 'Dashboard', route: '/dashboard', icon: <FiPieChart /> },
    { name: 'Gerenciar Projetos', route: '/my-owner-projects', icon: <FiGitPullRequest /> },
    { name: 'Testar Projetos', route: '/my-test-projects', icon: <FiPlay /> },
    { name: 'Encontrar Projetos', route: '/find-new-projects', icon: <FiSearch /> },
    { name: 'Perfil', route: '/profile', icon: <FiUser /> },
  ];

  const handleClickMenu = (event: React.MouseEvent, route: string) => {
    event.preventDefault();
    navigate(route);
    setMenuSelected(route);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav
        className={`bg-purple-800 text-gray-200 transition-width duration-300 ${
          isMenuOpen ? 'w-56' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full space-y-6 p-4">
          {menus.map((menu) => (
            <a
              key={menu.name}
              onClick={(event) => handleClickMenu(event, menu.route)}
              href="#"
              className={`flex items-center p-2 rounded hover:bg-purple-600 hover:text-white ${
                menu.route === menuSelected ? 'bg-purple-600 text-white' : ''
              }`}
              title={isMenuOpen ? '' : menu.name}
            >
              <span className="text-xl">{menu.icon}</span>
              {isMenuOpen && <span className="ml-4">{menu.name}</span>}
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white flex items-center justify-between px-6 py-3 border-b">
          <button
            className="text-gray-600 focus:outline-none"
            onClick={toggleMenu}
          >
            <FiMenu className="text-2xl" />
          </button>

          <img src={logo} alt="Logo" className="h-8" />

          <div className="space-x-4 flex items-center">
            <FiBell className="text-gray-500" />
            <FiUser className="text-gray-500" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PainelNavbar;
