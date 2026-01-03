import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

export interface AppSettings {
  backendBaseUrl: string;
  apiKey: string;
  defaultHeaders: Record<string, string>;
  theme: ThemeMode;
}

export interface AppState extends AppSettings {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_BACKEND_URL = "http://localhost:8080";

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      backendBaseUrl: DEFAULT_BACKEND_URL,
      apiKey: "",
      defaultHeaders: {},
      theme: "dark",
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      updateSettings: (settings) =>
        set((state) => ({
          ...state,
          ...settings,
          defaultHeaders: {
            ...state.defaultHeaders,
            ...(settings.defaultHeaders ?? {}),
          },
        })),
      resetSettings: () =>
        set({
          backendBaseUrl: DEFAULT_BACKEND_URL,
          apiKey: "",
          defaultHeaders: {},
          theme: "dark",
        }),
    }),
    {
      name: "shadow-dashboard-store",
      partialize: (state) => ({
        backendBaseUrl: state.backendBaseUrl,
        apiKey: state.apiKey,
        defaultHeaders: state.defaultHeaders,
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
