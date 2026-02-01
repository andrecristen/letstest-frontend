import React, { useEffect, useRef, useState } from "react";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiGitPullRequest,
  FiPlay,
  FiSearch,
  FiLogOut,
  FiMail,
  FiGlobe,
  FiBarChart2,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo-transparente.png";
import tokenProvider from "../infra/tokenProvider";
import notifyProvider from "../infra/notifyProvider";
import { cn } from "../ui";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markNotificationRead,
  NotificationItem,
} from "../services/notificationService";
import type { Socket } from "socket.io-client";

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
  const { t, i18n } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(
    localStorage.getItem("isMenuOpen") === "true"
  );
  const [menuSelected, setMenuSelected] = useState(location.pathname);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPage] = useState(1);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMenuSelected(location.pathname);
  }, [location.pathname]);

  const loadUnreadCount = async () => {
    const response = await getUnreadCount();
    const count = response?.data?.count ?? 0;
    setUnreadCount(count);
  };

  const loadNotifications = async () => {
    setNotificationLoading(true);
    try {
      const response = await getNotifications(notificationPage, 20);
      const data = response?.data?.data ?? [];
      const unreadOnly = data.filter((item: NotificationItem) => !item.readAt);
      setNotifications(unreadOnly);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    let pollId: number | undefined;

    pollId = window.setInterval(() => {
      loadUnreadCount();
    }, 120000);
    return () => {
      if (pollId) {
        window.clearInterval(pollId);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

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

      if (
        languageMenuRef.current &&
        languageButtonRef.current &&
        !languageMenuRef.current.contains(target) &&
        !languageButtonRef.current.contains(target)
      ) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    localStorage.setItem("isMenuOpen", `${newIsMenuOpen}`);
  };

  const toggleNotificationMenu = () => {
    const nextState = !isNotificationOpen;
    setIsNotificationOpen(nextState);
    if (nextState) {
      loadNotifications();
    }
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationOpen(false);
    setIsLanguageOpen(false);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageOpen(!isLanguageOpen);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleChangeLanguage = (language: "pt" | "en") => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    setIsLanguageOpen(false);
  };

  const languageOptions = [
    { id: "pt", label: "Português" },
    { id: "en", label: "English" },
  ] as const;

  const menus: Menu[] = [
    { name: t("nav.dashboard"), route: "/dashboard", icon: <FiBarChart2 /> },
    { name: t("nav.findProjects"), route: "/find-new-projects", icon: <FiSearch /> },
    { name: t("nav.manageProjects"), route: "/my-owner-projects", icon: <FiGitPullRequest /> },
    { name: t("nav.testProjects"), route: "/my-test-projects", icon: <FiPlay /> },
    { name: t("nav.invitations"), route: "/involvements/invitations", icon: <FiMail /> },
    { name: t("nav.requests"), route: "/involvements/requests", icon: <FiMail /> },
    { name: t("nav.myProfile"), route: "/profile", icon: <FiUser /> },
  ];

  const handleClickMenu = (event: React.MouseEvent, route: string) => {
    event.preventDefault();
    navigate(route);
    setMenuSelected(route);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-sand">
      <nav
        className={cn(
          "sticky top-0 flex h-screen flex-col gap-6 border-r border-ink/10 bg-shale px-3 py-6 text-sand transition-all duration-300",
          isMenuOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between px-2">
          {isMenuOpen && (
            <span className="font-display text-lg tracking-wide"></span>
          )}
          <button
            className="rounded-lg p-2 text-sand/80 hover:bg-sand/10"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {menus.map((menu) => {
            const isActive = menu.route === menuSelected;
            return (
              <button
                key={menu.name}
                type="button"
                onClick={(event) => handleClickMenu(event, menu.route)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-sand/10 text-sand"
                    : "text-sand/70 hover:bg-sand/10 hover:text-sand"
                )}
                title={isMenuOpen ? "" : menu.name}
              >
                <span className="text-lg">{menu.icon}</span>
                {isMenuOpen && <span className="font-medium">{menu.name}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-paper/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8" />
            <div className="hidden sm:block">
              <p className="font-display text-lg text-ink">{t("common.panel")}</p>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <button
              onClick={toggleNotificationMenu}
              className="relative rounded-full border border-ink/10 bg-paper p-2 text-ink/70 hover:text-ink"
              ref={notificationButtonRef}
              aria-label="Notificacoes"
            >
              <FiBell />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div
                className="absolute right-14 top-12 z-20 w-80 rounded-xl border border-ink/10 bg-paper p-4 text-sm text-ink/70 shadow-soft"
                ref={notificationMenuRef}
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/40">
                    {t("nav.notifications")}
                  </span>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-ocean hover:text-ink"
                      onClick={async () => {
                        await markAllRead();
                        setNotifications([]);
                        await loadUnreadCount();
                      }}
                    >
                      {t("nav.markAllRead")}
                    </button>
                  )}
                </div>

                {notificationLoading ? (
                  <div className="py-6 text-center text-xs text-ink/50">
                    {t("common.loading")}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-ink/50">
                    {t("nav.notificationsEmpty")}
                  </div>
                ) : (
                  <div className="max-h-72 space-y-3 overflow-auto pr-1">
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={async () => {
                          if (!item.readAt) {
                            await markNotificationRead(item.notificationId);
                            setNotifications((prev) => prev.filter((notification) => notification.id !== item.id));
                            await loadUnreadCount();
                          }
                        }}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          item.readAt
                            ? "border-ink/10 bg-paper/60"
                            : "border-ocean/30 bg-ocean/10"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-ink">{item.notification.title}</span>
                          <span className="text-[10px] text-ink/50">
                            {new Date(item.notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-ink/60">{item.notification.message}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full rounded-lg border border-ink/10 py-2 text-xs font-semibold text-ink/70 hover:border-ink/30"
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate("/notifications");
                    }}
                  >
                    {t("nav.viewAllNotifications")}
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <button
                onClick={toggleLanguageMenu}
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-2 text-ink/70 hover:text-ink"
                ref={languageButtonRef}
                aria-label="Idioma"
              >
                <FiGlobe />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {i18n.language === "en" ? "EN" : "PT"}
                </span>
              </button>
              {isLanguageOpen && (
                <div
                  className="absolute right-0 top-12 z-20 w-40 rounded-xl border border-ink/10 bg-paper p-2 text-sm text-ink/70 shadow-soft"
                  ref={languageMenuRef}
                >
                  {languageOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleChangeLanguage(option.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-ink/5",
                        i18n.language === option.id ? "text-ink" : "text-ink/70"
                      )}
                    >
                      <span>{option.label}</span>
                      {i18n.language === option.id ? (
                        <span className="text-xs uppercase tracking-[0.2em]">•</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleUserMenu}
              className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70 hover:text-ink"
              ref={userButtonRef}
              aria-label="Menu do usuario"
            >
              <FiUser />
            </button>
            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-ink/10 bg-paper p-2 text-sm text-ink/70 shadow-soft"
                ref={userMenuRef}
              >
                <button
                  onClick={() => {
                    tokenProvider.removeSession();
                    notifyProvider.info(t("nav.logoutSuccess"));
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-ink/5"
                >
                  <FiLogOut className="text-base" /> {t("nav.logout")}
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-ink/5"
                >
                  <FiUser className="text-base" /> {t("nav.myProfile")}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="rounded-3xl border border-ink/10 bg-paper/70 p-6 shadow-soft">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PainelNavbar;
