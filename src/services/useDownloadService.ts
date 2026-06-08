import { useState, useMemo } from 'react';

import { YtDlpRequest, StatusType, VideoMetadata } from '../../shared/types/downloadData';

export default function downloadService() {
    // consts declarations
    const [status, setStatus] = useState<StatusType>('idle');

    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [format, setFormat] = useState<string>('mp4');
    const [quality, setQuality] = useState<'best' | 'worst'>('best');
    const [outputPath, setOutputPath] = useState<string>('');
    const [isPlaylist, setIsPlaylist] = useState<boolean>(false);

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