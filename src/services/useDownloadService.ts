import { useState, useMemo, useEffect } from 'react';

import { YtDlpRequest, StatusType, VideoMetadata } from '../../shared/types/downloadData';
import { AppConfig } from '../../shared/types/configData';

import { useConfigService } from './useConfigService';

export default function downloadService() {
    const { getSettings } = useConfigService();

    // consts declarations
    const [status, setStatus] = useState<StatusType>('idle');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [format, setFormat] = useState<string>('mp4');
    const [quality, setQuality] = useState<'best' | 'worst'>('best');
    const [outputPath, setOutputPath] = useState<string>('');
    const [isPlaylist, setIsPlaylist] = useState<boolean>(false);

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
        try {
            const results = await window.electronAPI.getVideoMetadata(FetchRequestData);

            if (results && results.error) {
                setStatus('error');
                console.error(results.error, results.stderr);
                return;
            }
            const finalData = Array.isArray(results) ? results : [results];
            console.log('Fetched video metadata:', finalData);
            setVideoData(finalData);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            console.error('Error fetching video metadata:', error);
        }
    };

    const processDownloadLink = async (DownloadRequestData: YtDlpRequest) => {
        if (!downloadUrl) return;

        setStatus('downloading');

        try {
            await window.electronAPI.startDownload(DownloadRequestData);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            console.error('Error starting download:', error);
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
        getVideoMetadata,
        processDownloadLink
    } as const;
} 