import React, { useEffect, useRef, useState } from 'react';
import { FiMenu, FiBell, FiUser, FiGitPullRequest, FiPlay, FiSearch, FiPieChart, FiLogOut, FiMail } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-transparente.png';
import tokenService from '../../services/tokenService';
import notifyService from '../../services/notifyService';

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

  const [isMenuOpen, setIsMenuOpen] = useState(localStorage.getItem('isMenuOpen') === 'true');
  const [menuSelected, setMenuSelected] = useState(location.pathname);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationMenuRef.current &&
        notificationButtonRef.current &&
        !notificationMenuRef.current.contains(target) &&
        !notificationButtonRef.current.contains(target)
      ) {
        setIsNotificationOpen(false);
      }

      if (
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(target) &&
        !userButtonRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    localStorage.setItem('isMenuOpen', `${newIsMenuOpen}`);
  };

  const toggleNotificationMenu = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationOpen(false);
  };

  const menus: Menu[] = [
    { name: 'Dashboard', route: '/dashboard', icon: <FiPieChart /> },
    { name: 'Encontrar Projetos', route: '/find-new-projects', icon: <FiSearch /> },
    { name: 'Gerenciar Projetos', route: '/my-owner-projects', icon: <FiGitPullRequest /> },
    { name: 'Testar Projetos', route: '/my-test-projects', icon: <FiPlay /> },
    { name: 'Solicitações e Convites', route: '/involvements', icon: <FiMail /> },
    { name: 'Meu Perfil', route: '/profile', icon: <FiUser /> },
  ];

  const handleClickMenu = (event: React.MouseEvent, route: string) => {
    event.preventDefault();
    navigate(route);
    setMenuSelected(route);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className={`bg-purple-800 text-gray-200 transition-width duration-300 ${isMenuOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col h-full space-y-6 p-4">
          {menus.map((menu) => (
            <a
              key={menu.name}
              onClick={(event) => handleClickMenu(event, menu.route)}
              href="#"
              className={`flex items-center p-2 rounded hover:bg-purple-600 hover:text-white ${menu.route === menuSelected ? 'bg-purple-600 text-white' : ''
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
        <header className="bg-white flex items-center justify-between px-6 py-3 border-b relative">
          <button
            className="text-gray-600 focus:outline-none"
            onClick={toggleMenu}
          >
            <FiMenu className="text-2xl" />
          </button>

          <img src={logo} alt="Logo" className="h-8" />

          <div className="space-x-4 flex items-center relative">
            {/* Icone de Notificações */}
            <button
              onClick={toggleNotificationMenu}
              className="focus:outline-none relative"
              ref={notificationButtonRef}
            >
              <FiBell className="text-gray-500" />
              {/* Menu de Notificações */}
              {isNotificationOpen && (
                <div
                  className="absolute right-2 bg-white border shadow-lg p-4 w-48"
                  ref={notificationMenuRef}
                >
                  <p className="text-sm">Você não tem notificações</p>
                </div>
              )}
            </button>

            {/* Icone de Usuário */}
            <button
              onClick={toggleUserMenu}
              className="focus:outline-none relative"
              ref={userButtonRef}
            >
              <FiUser className="text-gray-500" />
              {/* Menu de Usuário */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-2 bg-white border shadow-lg p-4 w-48 flex flex-col"
                  ref={userMenuRef}
                >
                  <button
                    onClick={() => {
                      tokenService.removeSession();
                      notifyService.info("Usuário deslogado");
                      navigate("/login");
                    }}
                    className="text-sm hover:bg-gray-100 p-2 inline-flex items-center w-full"
                  >
                    <FiLogOut className="w-5 h-5 mr-2" />Logout
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-sm hover:bg-gray-100 p-2 inline-flex items-center w-full"
                  >
                    <FiUser className="w-5 h-5 mr-2" />Meu Perfil
                  </button>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-2 bg-gray-50 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PainelNavbar;