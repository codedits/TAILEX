"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { StoreConfig } from '@/services/config';
import { setGlobalCurrency, formatCurrency as utilsFormatCurrency, CurrencyConfig } from '@/lib/utils';

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
        if (typeof window !== 'undefined') {
            setGlobalCurrency(initialConfig.currency);
        }
    }, [initialConfig]);

    // During SSR, we also want to set the global currency once for the current request
    // Note: In Next.js App Router, this is safe because setGlobalCurrency updates a local variable
    // in the current module instance which is request-scoped on the server.
    if (typeof window === 'undefined') {
        setGlobalCurrency(initialConfig.currency);
    }

    return (
        <StoreConfigContext.Provider value={{ config }}>
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
