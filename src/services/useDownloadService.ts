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

    // memos
    const FetchRequestData = useMemo<YtDlpRequest>(() => {
        return { type: 'fetch', url: downloadUrl, isPlaylist };
    }, [downloadUrl, isPlaylist]);

    const DownloadRequestData = useMemo<YtDlpRequest>(() => {
        return { type: 'download', url: downloadUrl, format : format, quality : quality, outputPath : outputPath, isPlaylist};
    }, [downloadUrl, format, quality, outputPath, isPlaylist]);

    // API functions
    const getVideoMetadata = async () => {
        if (!downloadUrl) return;

        setStatus('analyzing');

        try {
            const results = await window.electronAPI.getVideoMetadata(FetchRequestData);

            if (results && results.error) {
                setStatus('error');
                console.error(results.error, results.stderr);
                return;
            }

            const finalData = Array.isArray(results) ? results : [results];

            setVideoData(finalData);
            setStatus('success');

        } catch (error) {
            setStatus('error');
            console.error('Error fetching video metadata:', error);
        }
    };

    const processDownloadLink = async () => {
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