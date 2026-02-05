import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrganization } from "../contexts/OrganizationContext";
import { useConfig } from "../contexts/ConfigContext";
import { cn } from "../ui";

const OrganizationSelector: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentOrganization, organizations, switchOrganization, isLoading } = useOrganization();
    const { billingEnabled } = useConfig();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(target) &&
                !buttonRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSwitch = async (orgId: number) => {
        if (orgId === currentOrganization?.id) {
            setIsOpen(false);
            return;
        }
        const success = await switchOrganization(orgId);
        if (success) {
            setIsOpen(false);
            window.location.reload();
        }
    };

    if (!currentOrganization || organizations.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={cn(
                    "flex items-center gap-2 rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink hover:border-ink/20",
                    isLoading && "opacity-50"
                )}
            >
                <span className="max-w-[140px] truncate font-medium">
                    {currentOrganization.name}
                </span>
                <FiChevronDown className={cn("text-ink/50 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute left-0 top-12 z-30 w-64 rounded-xl border border-ink/10 bg-paper shadow-soft"
                >
                    <div className="border-b border-ink/10 px-3 py-2">
                        <span className="text-xs uppercase tracking-[0.2em] text-ink/40">
                            {t("organization.switchOrg")}
                        </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleSwitch(org.id)}
                                className={cn(
                                    "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-ink/5",
                                    org.id === currentOrganization.id && "bg-ink/5"
                                )}
                            >
                                <div className="flex flex-col items-start">
                                    <span className={cn(
                                        "font-medium",
                                        org.id === currentOrganization.id ? "text-ink" : "text-ink/70"
                                    )}>
                                        {org.name}
                                    </span>
                                    {billingEnabled && (
                                        <span className="text-xs text-ink/50 capitalize">{org.plan}</span>
                                    )}
                                </div>
                                {org.id === currentOrganization.id && (
                                    <span className="text-xs text-ocean">•</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-ink/10 py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/my-organizations");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink/70 hover:bg-ink/5"
                        >
                            <FiUsers className="text-base" />
                            {t("nav.myOrganizations")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationSelector;
