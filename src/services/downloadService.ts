import { useState } from 'react';

import { statusType, VideoMetadata } from '../types/downloadData';

export default function downloadService() {
    // consts declarations
    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [status, setStatus] = useState<statusType>('idle');
    const [videoData, setVideoData] = useState<VideoMetadata[]>([]);

    // API functions
    const getVideoMetadata = async () => {
        if (!downloadUrl) return;

        setStatus('analyzing');

        try {
            const results = await window.electronAPI.getVideoMetadata(downloadUrl);

            if (results && results.error) {
                setStatus('error');
                console.error(results.error);
                return;
            }

            const finalData = Array.isArray(results) ? results : [results];

            setVideoData(finalData);
            setStatus('success');

            console.log('Otrzymane metadane:', finalData);

        } catch (error) {
            setStatus('error');
            console.error('Error fetching video metadata:', error);
        }
    };

    const processDownloadLink = async () => {

    };

    // returning the consts
    return { downloadUrl, setDownloadUrl, status, setStatus, videoData, getVideoMetadata, processDownloadLink } as const;
} 