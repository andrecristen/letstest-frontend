import React, { useEffect, useState } from 'react';
import { FiMenu, FiBell, FiUser, FiGitPullRequest, FiPlay, FiSearch, FiPieChart } from 'react-icons/fi';
import logo from '../../assets/logo-transparente.png'
import { useLocation, useNavigate } from 'react-router-dom';

const PainelNavbar = (props: any) => {

    const navigate = useNavigate();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuSelected, setMenuSelected] = useState(location.pathname);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menus = [
        {
            name: "Dashboard",
            route: "/dashboard",
            icon: <FiPieChart className="w-12 h-12" />
        },
        {
            name: "Gerenciar Projetos",
            route: "/my-owner-projects",
            icon: <FiGitPullRequest className="w-12 h-12" />
        },
        {
            name: "Testar Projetos",
            route: "/my-test-projects",
            icon: <FiPlay className=" w-12 h-12" />
        },
        {
            name: "Encontrar Projetos",
            route: "/find-new-projects",
            icon: <FiSearch className="w-12 h-12" />
        },
        {
            name: "Perfil",
            route: "/profile",
            icon: <FiUser className="w-12 h-12" />
        },
    ];

    const onClickMenu = (route: string) => {
        navigate(route);
        setMenuSelected(route);
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <nav
                className={`bg-purple-900 text-gray-300 border-r overflow-y-auto transition-all duration-100 ease-in-out ${isMenuOpen ? 'w-64' : 'w-0 md:w-16 2xl:w-16'}`}
            >
                <div className="space-y-8">
                    {menus.map((menu) => (
                        <a title={menu.name} onClick={() => { onClickMenu(menu.route) }} href="#" className={"p-2 hover:bg-purple-600 hover:text-white flex items-center " + (menu.route == menuSelected ? "bg-purple-600 text-white" : "")}>
                            {menu.icon}
                            {isMenuOpen && <span className="ml-2">{menu.name}</span>}
                        </a>
                    ))}
                </div>
            </nav>
            {/* Conteúdo principal */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Cabeçalho */}
                <header className="w-full bg-white min-h-[64px] max-h-[64px]">
                    <div className="mr-6 h-full">
                        <div className="flex items-center justify-between h-full">
                            <button
                                className="text-gray-500 focus:outline-none w-15 h-full pl-5"
                                onClick={toggleMenu}
                            >
                                <FiMenu className='text-4xl' />
                            </button>
                            {/* Logo e outros elementos do cabeçalho */}
                            <img src={logo} alt="Logo" className="h-8" />
                            <div className="space-x-4">
                                <button>
                                    <FiBell className="text-gray-500" />
                                </button>
                                <button>
                                    <FiUser className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo */}
                <div className="px-2 mb-10 overflow-auto lg:mb-2">
                    {props.children}
                </div>
            </main>
        </div>
    );
};

export default PainelNavbar;