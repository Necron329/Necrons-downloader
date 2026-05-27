import { useState } from 'react';

import { statusType, VideoMetadata } from '../types/downloadData';

export default function downloadService() {
    // consts declarations
    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [status, setStatus] = useState<statusType>('idle');
    const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

// helper functions
    const extractMetadata = (rawData: any, url: string): VideoMetadata => {
        const isPlaylist = rawData._type === 'playlist';
        
        return {
            title: rawData.title || 'Unknown Title',
            duration: rawData.duration || 0,
            thumbnail: rawData.thumbnail || '',
            author: rawData.uploader || rawData.channel || 'Unknown Author',
            isPlaylist: isPlaylist,
            url: url
        };
    };

// API functions
    const getVideoMetadata = async () => {
        if (!downloadUrl) {
            console.error('No download URL provided');
            return;
        }

        setStatus('analyzing');

        try {
            const rawData = await window.electronAPI.getVideoMetadata(downloadUrl);
            
            if (rawData.error) {
                setStatus('error');
                console.error(rawData.error);
                return;
            }

            const mappedMetadata = extractMetadata(rawData, downloadUrl);

            setVideoData(mappedMetadata);
            setStatus('success');
            return rawData;

        } catch (error) {
            setStatus('error');
            console.error('Error fetching video metadata:', error);
            throw error;
        }
    }

    const processDownloadLink = async () => {

    };


    // returning the consts
    return { downloadUrl, setDownloadUrl, status, setStatus, videoData, getVideoMetadata, processDownloadLink } as const;
} 