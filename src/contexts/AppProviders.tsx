import { ReactNode } from 'react';
import { ToastProvider } from "./ToastContext";
import { DownloadProvider } from "./DownloadContext";
import { SettingsProvider } from "./SettingsContext";
import { MetadataProvider } from "./MetadataContext";

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
    return (
        <ToastProvider>
            <SettingsProvider>
                <DownloadProvider>
                    <MetadataProvider>
                        {children}
                    </MetadataProvider>
                </DownloadProvider>
            </SettingsProvider>
        </ToastProvider>
    );
};