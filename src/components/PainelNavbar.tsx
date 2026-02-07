import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiGitPullRequest,
  FiPlay,
  FiLogOut,
  FiMail,
  FiGlobe,
  FiBarChart2,
  FiTool,
  FiVideo,
  FiCheckSquare,
  FiUsers,
  FiKey,
  FiLink,
  FiX,
  FiSun,
  FiMoon,
  FiSettings,
  FiCreditCard,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo-transparente.png";
import tokenProvider from "../infra/tokenProvider";
import notifyProvider from "../infra/notifyProvider";
import { cn } from "../ui";
import Modal from "../ui/Modal";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markNotificationRead,
  NotificationItem,
} from "../services/notificationService";
import type { Socket } from "socket.io-client";
import OrganizationSelector from "./OrganizationSelector";
import { useOrganization } from "../contexts/OrganizationContext";
import { useConfig } from "../contexts/ConfigContext";
import { useTheme } from "../contexts/ThemeContext";

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
  const { clearContext } = useOrganization();
  const { isSelfHosted, billingEnabled } = useConfig();
  const { isOwner } = useOrganization();
  const userName = useMemo(() => tokenProvider.getSessionUserName(), []);
  const isSystemAdmin = useMemo(() => (tokenProvider.getAccessLevel() ?? 0) >= 99, []);
  const { isDark, toggleTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(
    localStorage.getItem("isMenuOpen") === "true"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuSelected, setMenuSelected] = useState(location.pathname);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPage] = useState(1);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [checklistItems, setChecklistItems] = useState<
    { id: string; text: string; done: boolean }[]
  >([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const toolsButtonRef = useRef<HTMLButtonElement | null>(null);

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
    const stored = localStorage.getItem("testerChecklist");
    if (stored) {
      try {
        setChecklistItems(JSON.parse(stored));
        return;
      } catch {
        // ignore malformed storage
      }
    }
    setChecklistItems([
      { id: "env", text: t("nav.toolsChecklistDefaultEnvironment"), done: false },
      { id: "scenario", text: t("nav.toolsChecklistDefaultScenario"), done: false },
      { id: "data", text: t("nav.toolsChecklistDefaultData"), done: false },
      { id: "evidence", text: t("nav.toolsChecklistDefaultEvidence"), done: false },
      { id: "notes", text: t("nav.toolsChecklistDefaultNotes"), done: false },
    ]);
  }, [t]);

  useEffect(() => {
    localStorage.setItem("testerChecklist", JSON.stringify(checklistItems));
  }, [checklistItems]);

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

      if (
        toolsMenuRef.current &&
        toolsButtonRef.current &&
        !toolsMenuRef.current.contains(target) &&
        !toolsButtonRef.current.contains(target)
      ) {
        setIsToolsOpen(false);
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
    setIsToolsOpen(false);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageOpen(!isLanguageOpen);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
    setIsToolsOpen(false);
  };

  const toggleToolsMenu = () => {
    setIsToolsOpen(!isToolsOpen);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
    setIsLanguageOpen(false);
  };

  const handleChangeLanguage = (language: "pt" | "en") => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    setIsLanguageOpen(false);
  };

  const handleRecordScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = `gravacao-tela-${Date.now()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      };

      recorder.start();
      notifyProvider.success(t("nav.toolsRecordingStarted"));
      setIsToolsOpen(false);
    } catch (error) {
      notifyProvider.error(t("nav.toolsRecordingError"));
    }
  };

  const openChecklist = () => {
    setIsChecklistOpen(true);
    setIsToolsOpen(false);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addChecklistItem = () => {
    const text = newChecklistItem.trim();
    if (!text) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: `${Date.now()}`, text, done: false },
    ]);
    setNewChecklistItem("");
  };

  const languageOptions = [
    { id: "pt", label: "Português" },
    { id: "en", label: "English" },
  ] as const;

  const menus: Menu[] = [
    { name: t("nav.dashboard"), route: "/dashboard", icon: <FiBarChart2 /> },
    // { name: t("nav.findProjects"), route: "/find-new-projects", icon: <FiSearch /> },
    { name: t("nav.manageProjects"), route: "/my-owner-projects", icon: <FiGitPullRequest /> },
    { name: t("nav.testProjects"), route: "/my-test-projects", icon: <FiPlay /> },
    { name: t("nav.myOrganizations"), route: "/my-organizations", icon: <FiUsers /> },
    ...(billingEnabled && isOwner ? [{ name: t("nav.billing"), route: "/billing", icon: <FiBarChart2 /> }] : []),
    ...(billingEnabled && isOwner ? [{ name: t("nav.apiKeys"), route: "/organization/api-keys", icon: <FiKey /> }] : []),
    ...(billingEnabled && isOwner ? [{ name: t("nav.webhooks"), route: "/organization/webhooks", icon: <FiLink /> }] : []),
    ...(isSystemAdmin ? [
      { name: t("nav.admin"), route: "/admin/billing-plans", icon: <FiSettings /> },
      { name: t("nav.adminSubscriptions"), route: "/admin/subscriptions", icon: <FiCreditCard /> },
    ] : []),
    // { name: t("nav.invitations"), route: "/involvements/invitations", icon: <FiMail /> },
    // { name: t("nav.requests"), route: "/involvements/requests", icon: <FiMail /> },
    { name: t("nav.orgInvites"), route: "/my-invites", icon: <FiMail /> },
    { name: t("nav.myProfile"), route: "/profile", icon: <FiUser /> },
  ];

  const handleClickMenu = (event: React.MouseEvent, route: string) => {
    event.preventDefault();
    navigate(route);
    setMenuSelected(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="relative flex h-full w-64 flex-col gap-6 bg-shale-fixed px-3 py-6 text-sand-fixed shadow-soft">
            <div className="flex items-center justify-between px-2">
              <span className="font-display text-lg tracking-wide"></span>
              <button
                className="rounded-lg p-2 text-sand-fixed/80 hover:bg-sand-fixed/10"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FiX className="text-xl" />
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
                        ? "bg-sand-fixed/10 text-sand-fixed"
                        : "text-sand-fixed/70 hover:bg-sand-fixed/10 hover:text-sand-fixed"
                    )}
                  >
                    <span className="text-lg">{menu.icon}</span>
                    <span className="font-medium">{menu.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav
        className={cn(
          "sticky top-0 hidden h-screen flex-col gap-6 border-r border-ink/10 bg-shale-fixed px-3 py-6 text-sand-fixed shadow-soft transition-all duration-300 md:flex",
          isMenuOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between px-2">
          {isMenuOpen && (
            <span className="font-display text-lg tracking-wide"></span>
          )}
          <button
            className="rounded-lg p-2 text-sand-fixed/80 hover:bg-sand-fixed/10"
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
                    ? "bg-sand-fixed/10 text-sand-fixed"
                    : "text-sand-fixed/70 hover:bg-sand-fixed/10 hover:text-sand-fixed"
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
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-paper/90 px-3 py-2 backdrop-blur md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile hamburger button */}
            <button
              className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="text-xl" />
            </button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-8" />
              <div className="hidden sm:block">
                <p className="font-display text-lg text-ink">{t("common.panel")}</p>
              </div>
            </div>
            <OrganizationSelector />
            {isSelfHosted && (
              <span className="hidden rounded-full bg-ocean/10 px-2 py-1 text-xs font-medium text-ocean sm:inline-flex">
                {t("common.selfHosted")}
              </span>
            )}
          </div>

          <div className="relative flex items-center gap-2 md:gap-4">
            <div className="relative">
            <button
              onClick={toggleToolsMenu}
              className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70 shadow-soft hover:text-ink"
              ref={toolsButtonRef}
              aria-label={t("nav.tools")}
            >
                <FiTool />
              </button>
              {isToolsOpen && (
                <div
                  className="absolute right-0 top-12 z-20 w-[calc(100vw-2rem)] rounded-xl border border-ink/10 bg-paper/95 p-2 text-sm text-ink/70 shadow-soft sm:w-56"
                  ref={toolsMenuRef}
                >
                  <button
                    type="button"
                    onClick={handleRecordScreen}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-ink/5"
                  >
                    <FiVideo className="text-base" /> {t("nav.toolsRecordScreen")}
                  </button>
                  <button
                    type="button"
                    onClick={openChecklist}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-ink/5"
                  >
                    <FiCheckSquare className="text-base" /> {t("nav.toolsChecklist")}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleNotificationMenu}
              className="relative rounded-full border border-ink/10 bg-paper p-2 text-ink/70 shadow-soft hover:text-ink"
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
                className="absolute right-0 top-12 z-20 w-[calc(100vw-2rem)] rounded-xl border border-ink/10 bg-paper/95 p-4 text-sm text-ink/70 shadow-soft sm:w-80"
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

            <button
              onClick={toggleTheme}
              className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70 shadow-soft hover:text-ink"
              aria-label={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </button>

            <div className="relative">
            <button
              onClick={toggleLanguageMenu}
              className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper px-2 py-2 text-ink/70 shadow-soft hover:text-ink md:gap-2 md:px-3"
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
                  className="absolute right-0 top-12 z-20 w-40 rounded-xl border border-ink/10 bg-paper/95 p-2 text-sm text-ink/70 shadow-soft"
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
              className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper px-2 py-2 text-ink/70 shadow-soft hover:text-ink md:gap-2 md:px-3"
              ref={userButtonRef}
              aria-label="Menu do usuario"
            >
              <FiUser />
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-ink/70 sm:inline">
                {userName || t("nav.myProfile")}
              </span>
            </button>
            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-12 z-20 w-[calc(100vw-2rem)] rounded-xl border border-ink/10 bg-paper/95 p-2 text-sm text-ink/70 shadow-soft sm:w-56"
                ref={userMenuRef}
              >
                <button
                  onClick={() => {
                    clearContext();
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

        <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
          <div className="rounded-2xl border border-ink/10 bg-paper/85 p-4 shadow-soft md:rounded-[28px] md:p-6">
            {children}
          </div>
        </div>
      </main>

      <Modal open={isChecklistOpen} onClose={() => setIsChecklistOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                {t("nav.toolsChecklist")}
              </p>
              <h2 className="font-display text-xl text-ink">
                {t("nav.toolsChecklistTitle")}
              </h2>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-ink/60 hover:text-ink"
              onClick={() => setIsChecklistOpen(false)}
            >
              {t("common.close")}
            </button>
          </div>

          <div className="space-y-2">
            {checklistItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink/10 p-4 text-center text-sm text-ink/50">
                {t("nav.toolsChecklistEmpty")}
              </div>
            ) : (
              checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper px-3 py-2"
                >
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="h-4 w-4 rounded border-ink/30 text-ink"
                    />
                    <span className={item.done ? "line-through text-ink/50" : ""}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-ink/50 hover:text-ink"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    {t("common.remove")}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newChecklistItem}
              onChange={(event) => setNewChecklistItem(event.target.value)}
              placeholder={t("nav.toolsChecklistPlaceholder")}
              className="flex-1 rounded-xl border border-ink/10 px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="rounded-xl border border-ink/10 bg-ink px-4 py-2 text-sm font-semibold text-sand hover:bg-ink/90"
            >
              {t("nav.toolsChecklistAdd")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PainelNavbar;
