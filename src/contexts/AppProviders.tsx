import { ReactNode } from 'react';
import { ToastProvider } from "./ToastContext";
import { DownloadProvider } from "./DownloadContext";
import { SettingsProvider } from "./SettingsContext";

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
    return (
        <ToastProvider>
            <SettingsProvider>
                <DownloadProvider>
                    {children}
                </DownloadProvider>
            </SettingsProvider>
        </ToastProvider>
    );
};