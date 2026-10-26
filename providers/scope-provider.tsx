'use client';

/**
 * Global Scope Provider.
 *
 * Provides application-level scope management (e.g. workspace, organization,
 * or environment context) across protected pages and components.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const DEFAULT_SCOPE = 'default' as const;

export type ScopeValue = string;

interface ScopeContextValue {
  scope: ScopeValue;
  setScope: (value: ScopeValue) => void;
  label: string;
}

const ScopeContext = createContext<ScopeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app_admin_scope';

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeState] = useState<ScopeValue>(DEFAULT_SCOPE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setScopeState(stored);
    } catch {
      // Storage access blocked or unavailable
    }
  }, []);

  const value = useMemo<ScopeContextValue>(() => {
    return {
      scope,
      setScope: (next: ScopeValue) => {
        setScopeState(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Ignore write failure
        }
      },
      label: scope === DEFAULT_SCOPE ? 'Default Scope' : scope,
    };
  }, [scope]);

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope(): ScopeContextValue {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error('useScope must be used within a ScopeProvider');
  return ctx;
}
