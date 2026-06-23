import { useState, useMemo, useEffect } from 'react';

import { useToast } from '../contexts/toastProvider';

import { YtDlpRequest, StatusType, VideoMetadata, ProgressPayload } from '../../shared/types/downloadData';
import { AppConfig } from '../../shared/types/configData';

import { settingsApi } from "../api/settingsApi";

export default function downloadService() {
    const { addToast } = useToast();

    const { getSettings, updateSettings } = settingsApi();

    // consts declarations
    const [status, setStatus] = useState<StatusType>('idle');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [format, setFormat] = useState<string>('mp4');
    const [quality, setQuality] = useState<'best' | 'worst'>('best');
    const [outputPath, setOutputPath] = useState<string>('');
    const [isPlaylist, setIsPlaylist] = useState<boolean>(false);

    const [progress, setProgress] = useState<ProgressPayload | null>(null);

    useEffect(() => {
        const initSettings = async () => {
            try {
                setIsLoading(true);
                const settings: AppConfig = await getSettings();
                if (settings) {
                    if (settings.quality) setQuality(settings.quality);
                    if (settings.format) setFormat(settings.format);
                    if (settings.outputPath) setOutputPath(settings.outputPath);
                    if (settings.isPlaylist !== undefined) setIsPlaylist(settings.isPlaylist);
                }
            } catch (error) {
                console.error("Błąd podczas ładowania ustawień:", error);
                setStatus('error');
            } finally {
                setIsLoading(false);
            }
        };

        initSettings();
    }, []);

    useEffect(() => {
        const unsubscribe = window.electronAPI.onDownloadProgress((data: ProgressPayload) => {
            setProgress(data);
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const [videoData, setVideoData] = useState<VideoMetadata[]>([]);

    //imported from downloads page
    const [isValid, setIsValid] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);

    // memos
    const FetchRequestData = useMemo<YtDlpRequest>(() => {
        return { type: 'fetch', url: downloadUrl, isPlaylist };
    }, [downloadUrl, isPlaylist]);

    // API functions
    const getVideoMetadata = async () => {
        if (!downloadUrl) return;
        setStatus('fetching');
        try {
            const results = await window.electronAPI.getVideoMetadata(FetchRequestData);

            if (results && results.error) {
                setStatus('error');
                console.error(results.error, results.stderr);
                addToast('Error fetching video metadata, check console for further information.', 10000);
                return;
            }
            const finalData = Array.isArray(results) ? results : [results];
            setVideoData(finalData);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            addToast('Error fetching video metadata, check console for further information.', 10000);
            console.error('Error fetching video metadata:', error);
        }
    };

    const processDownloadLink = async (DownloadRequestData: YtDlpRequest) => {
        if (!downloadUrl) return;

        setStatus('downloading');
        setProgress(null);

        try {
            await window.electronAPI.startDownload(DownloadRequestData);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            addToast('Error while downloading, check console for further information.', 10000);
            console.error('Error starting download:', error);
        }
    };

    const chooseDirectory = async (): Promise<void> => {
        try {
            const selectedPath = await window.electronAPI.chooseDirectory();

            if (selectedPath) {
                setOutputPath(selectedPath);
                updateSettings({ outputPath: selectedPath });
            }
        } catch (error) {
            addToast('Error while choosing directory, check console for further information.', 10000);
            console.error("Error while choosing directory:", error);
        }
    };

    // returning the consts
    return {
        downloadUrl,
        setDownloadUrl,
        isValid,
        setIsValid,
        analyzed,
        setAnalyzed,
        isLoading,
        status,
        setStatus,
        format,
        setFormat,
        quality,
        setQuality,
        outputPath,
        setOutputPath,
        isPlaylist,
        setIsPlaylist,
        videoData,
        chooseDirectory,
        getVideoMetadata,
        updateSettings,
        processDownloadLink,
        progress
    } as const;
} 