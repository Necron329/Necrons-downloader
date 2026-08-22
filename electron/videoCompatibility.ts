import path from 'node:path';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { spawn } from 'child_process';
import { ffprobePath, resourcesPath } from './config';
import { ProgressPayload } from '../shared/types/downloadData';

export interface MediaInfo {
  container: string;
  videoCodec?: string;
  audioCodec?: string;
  pixelFormat?: string;
  duration?: number;
  width?: number;
  height?: number;
  frameRate?: string;
  sampleRate?: string;
  channels?: number;
  videoProfile?: string;
  videoLevel?: number;
}

interface FFprobeStream {
  codec_type: string;
  codec_name?: string;
  pix_fmt?: string;
  profile?: string;
  level?: number;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  sample_rate?: string;
  channels?: number;
}

interface FFprobeFormat {
  format_name?: string;
  duration?: string;
}

interface FFprobeOutput {
  format?: FFprobeFormat;
  streams?: FFprobeStream[];
}

export async function inspectMedia(filePath: string): Promise<MediaInfo> {
  if (!ffprobePath || !fs.existsSync(filePath)) {
    throw new Error('Invalid path or ffprobe missing');
  }

  const args = [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(ffprobePath, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));

    child.on('error', (err) => reject(new Error(`FFprobe failed to start: ${err.message}`)));

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`FFprobe exited with code ${code}: ${stderr.trim()}`));
      }

      try {
        const parsed = JSON.parse(stdout) as FFprobeOutput;
        const format = parsed.format || {};
        const streams = parsed.streams || [];

        const videoStream = streams.find((s) => s.codec_type === 'video');
        const audioStream = streams.find((s) => s.codec_type === 'audio');

        const info: MediaInfo = {
          container: format.format_name || '',
          duration: format.duration ? parseFloat(format.duration) : undefined,
        };

        if (videoStream) {
          info.videoCodec = videoStream.codec_name;
          info.pixelFormat = videoStream.pix_fmt;
          info.width = videoStream.width;
          info.height = videoStream.height;
          info.frameRate = videoStream.r_frame_rate;
          info.videoProfile = videoStream.profile;
          info.videoLevel = videoStream.level != null ? Number(videoStream.level) : undefined;
        }

        if (audioStream) {
          info.audioCodec = audioStream.codec_name;
          info.sampleRate = audioStream.sample_rate;
          info.channels = audioStream.channels;
        }

        resolve(info);
      } catch (e) {
        reject(new Error(`Failed to parse FFprobe JSON: ${e instanceof Error ? e.message : String(e)}`));
      }
    });
  });
}

export function isCompatible(info: MediaInfo): boolean {
  const container = info.container.toLowerCase();
  const isMp4Container = container.includes('mp4') || container.includes('mov') || container.includes('m4a');

  const isH264 = info.videoCodec === 'h264' || info.videoCodec === 'avc';
  const isAac = info.audioCodec === 'aac';
  const isYuv420p = info.pixelFormat === 'yuv420p';

  return isMp4Container && isH264 && isAac && isYuv420p;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${value}${sizes[i]}`;
}

export async function makeCompatible(
  inputPath: string,
  onProgress?: (progress: ProgressPayload) => void,
  duration?: number
): Promise<string> {
  if (!resourcesPath) {
    throw new Error('FFmpeg resources path is missing');
  }

  const ffmpegBinary = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const ffmpegPath = path.join(resourcesPath, ffmpegBinary);

  if (!fs.existsSync(ffmpegPath)) {
    throw new Error('FFmpeg binary not found');
  }

  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const tempOutput = path.join(dir, `${baseName}_compat_${Date.now()}.mp4`);

  const args: string[] = [
    '-i', inputPath,
    '-progress', 'pipe:1',
    '-nostats',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '23',
    '-preset', 'medium',
    '-profile:v', 'high',
    '-level', '4.0',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    '-map', '0',
    tempOutput
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args);
    let stderr = '';
    let stdoutBuffer = '';

    child.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop() || '';

      const progressData: Record<string, string> = {};

      for (const line of lines) {
        const eqIndex = line.indexOf('=');
        if (eqIndex > 0) {
          const key = line.slice(0, eqIndex).trim();
          const value = line.slice(eqIndex + 1).trim();
          progressData[key] = value;
        }
      }

      if (onProgress && duration && duration > 0) {
        const outTimeUs = parseInt(progressData['out_time_us'], 10);
        if (!isNaN(outTimeUs)) {
          const currentTime = outTimeUs / 1_000_000;
          const percent = Math.min(100, Math.round((currentTime / duration) * 100));

          const speedRaw = progressData['speed'];
          let speed = '';
          if (speedRaw && speedRaw !== 'N/A') {
            const speedMultiplier = parseFloat(speedRaw);
            if (!isNaN(speedMultiplier)) {
              speed = `${speedMultiplier.toFixed(1)}x`;
            }
          }

          let eta = '00:00';
          if (speedRaw && speedRaw !== 'N/A') {
            const speedMultiplier = parseFloat(speedRaw);
            if (!isNaN(speedMultiplier) && speedMultiplier > 0) {
              const remaining = duration - currentTime;
              const etaSeconds = remaining / speedMultiplier;
              if (etaSeconds > 0 && etaSeconds < 86400) {
                const hours = Math.floor(etaSeconds / 3600);
                const minutes = Math.floor((etaSeconds % 3600) / 60);
                const seconds = Math.floor(etaSeconds % 60);
                if (hours > 0) {
                  eta = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                  eta = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
              }
            }
          }

          const totalSize = progressData['total_size'];
          const filesize = totalSize ? formatBytes(parseInt(totalSize, 10)) : '';

          onProgress({
            percent,
            filesize,
            speed,
            eta
          } satisfies ProgressPayload);
        }
      }
    });

    child.on('error', (err) => {
      cleanupTemp();
      reject(new Error(`FFmpeg failed to start: ${err.message}`));
    });

    const cleanupTemp = () => {
      if (fs.existsSync(tempOutput)) {
        fsPromises.unlink(tempOutput).catch(() => {});
      }
    };

    child.on('close', async (code) => {
      if (code !== 0) {
        cleanupTemp();
        console.error('[FFmpeg Error]', stderr);
        return reject(new Error(`FFmpeg transcoding failed with code ${code}`));
      }

      try {
        if (fs.existsSync(inputPath)) {
          await fsPromises.unlink(inputPath);
        }
        await fsPromises.rename(tempOutput, inputPath);
        resolve(inputPath);
      } catch (err) {
        cleanupTemp();
        reject(new Error(`File swap failed: ${err instanceof Error ? err.message : String(err)}`));
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
  });
}
