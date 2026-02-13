"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { StoreConfig } from '@/services/config';
import { formatCurrency as utilsFormatCurrency, CurrencyConfig } from '@/lib/utils';

interface StoreConfigContextType {
    config: StoreConfig;
}

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export function StoreConfigProvider({
    children,
    initialConfig
}: {
    children: React.ReactNode;
    initialConfig: StoreConfig;
}) {
    // We use a state only to allow client-side updates if needed (e.g. previewing in admin)
    // But for SSR, initialConfig is what matters.
    const [config, setConfig] = useState<StoreConfig>(initialConfig);

    // Sync state with props when they change (critical for admin preview/navigation)
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    // During SSR, we no longer need to set a global variable.
    // The currency is passed down via the Context to the useFormatCurrency hook consumers.

    const contextValue = useMemo(() => ({ config }), [config]);

    return (
        <StoreConfigContext.Provider value={contextValue}>
            {children}
        </StoreConfigContext.Provider>
    );
}

export function useStoreConfig() {
    const context = useContext(StoreConfigContext);
    if (context === undefined) {
        throw new Error('useStoreConfig must be used within a StoreConfigProvider');
    }
    return context.config;
}

/**
 * Hook to get the currency formatter with the correct configuration
 * Use this in Client Components to avoid flashes.
 */
export function useFormatCurrency() {
    const { currency } = useStoreConfig();

    return useCallback((amount: number) => {
        return utilsFormatCurrency(amount, currency);
    }, [currency]);
}
