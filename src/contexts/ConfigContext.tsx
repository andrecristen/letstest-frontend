import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getConfig, SystemConfig } from '../services/configService';

type ConfigContextType = {
    config: SystemConfig | null;
    isLoading: boolean;
    isSelfHosted: boolean;
    billingEnabled: boolean;
    maxOrganizations: number | null;
};

const defaultConfig: SystemConfig = {
    isSelfHosted: false,
    billingEnabled: true,
    maxOrganizations: null,
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SystemConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await getConfig();
                setConfig(data);
            } catch (error) {
                console.error('Failed to load system config:', error);
                setConfig(defaultConfig);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const value: ConfigContextType = {
        config,
        isLoading,
        isSelfHosted: config?.isSelfHosted ?? false,
        billingEnabled: config?.billingEnabled ?? true,
        maxOrganizations: config?.maxOrganizations ?? null,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextType => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};

export default ConfigContext;
