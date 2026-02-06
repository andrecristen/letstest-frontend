import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import tokenProvider, { Organization } from '../infra/tokenProvider';
import api from '../infra/http-request/apiTokenProvider';

type OrganizationContextType = {
    currentOrganization: Organization | null;
    organizations: Organization[];
    isLoading: boolean;
    switchOrganization: (orgId: number) => Promise<boolean>;
    refreshOrganizations: () => Promise<void>;
    clearContext: () => void;
    reloadFromSession: () => void;
    isOwner: boolean;
    isAdmin: boolean;
    canManage: boolean;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFromSession = useCallback(() => {
        const orgId = tokenProvider.getOrganizationId();
        const orgs = tokenProvider.getOrganizations();
        setOrganizations(orgs);

        if (orgId && orgs.length > 0) {
            const current = orgs.find(org => org.id === orgId);
            if (current) {
                setCurrentOrganization(current);
            }
        } else if (!orgId && orgs.length > 0) {
            // Auto-select first org if none selected
            setCurrentOrganization(orgs[0]);
        } else {
            setCurrentOrganization(null);
        }
    }, []);

    const clearContext = useCallback(() => {
        setCurrentOrganization(null);
        setOrganizations([]);
    }, []);

    const reloadFromSession = useCallback(() => {
        loadFromSession();
    }, [loadFromSession]);

    useEffect(() => {
        loadFromSession();
    }, [loadFromSession]);

    // Listen for storage changes (logout/login in another tab)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'session') {
                if (e.newValue === null) {
                    clearContext();
                } else {
                    loadFromSession();
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadFromSession, clearContext]);

    const refreshOrganizations = useCallback(async () => {
        try {
            const response = await api.get('/organizations');
            if (response?.data) {
                const orgs: Organization[] = response.data.map((org: any) => ({
                    id: org.id,
                    name: org.name,
                    slug: org.slug,
                    plan: org.plan,
                    role: org.role,
                }));
                setOrganizations(orgs);
                tokenProvider.updateOrganizations(orgs);

                const currentOrgId = tokenProvider.getOrganizationId();
                if (currentOrgId) {
                    const current = orgs.find(o => o.id === currentOrgId);
                    if (current) {
                        setCurrentOrganization(current);
                    } else if (orgs.length > 0) {
                        // Current org no longer exists, select first available
                        setCurrentOrganization(orgs[0]);
                    }
                } else if (orgs.length > 0) {
                    // No current org selected, auto-select first one
                    const firstOrg = orgs[0];
                    setCurrentOrganization(firstOrg);
                    // Also update session with selected org
                    const session = tokenProvider.getSession();
                    if (session) {
                        tokenProvider.setSession(
                            session.token,
                            session.userId,
                            session.userName,
                            firstOrg.id,
                            firstOrg.slug,
                            firstOrg.role,
                            orgs
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Failed to refresh organizations:', error);
        }
    }, []);

    const switchOrganization = useCallback(async (orgId: number): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await api.post('/users/auth/switch-org', { organizationId: orgId });
            if (response?.data?.token) {
                const { token, organization } = response.data;
                tokenProvider.updateOrganization(
                    token,
                    organization.id,
                    organization.slug,
                    organization.role
                );

                const updatedOrg: Organization = {
                    id: organization.id,
                    name: organization.name,
                    slug: organization.slug,
                    plan: organization.plan,
                    role: organization.role,
                };
                setCurrentOrganization(updatedOrg);

                // Update the org in the list with the new role if needed
                setOrganizations(prev =>
                    prev.map(o => o.id === orgId ? updatedOrg : o)
                );

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to switch organization:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const role = currentOrganization?.role ?? '';
    const isOwner = role === 'owner';
    const isAdmin = role === 'admin';
    const canManage = isOwner || isAdmin;

    return (
        <OrganizationContext.Provider
            value={{
                currentOrganization,
                organizations,
                isLoading,
                switchOrganization,
                refreshOrganizations,
                clearContext,
                reloadFromSession,
                isOwner,
                isAdmin,
                canManage,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = (): OrganizationContextType => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};

export default OrganizationContext;
