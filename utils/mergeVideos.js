import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';

export async function mergeVideosFromUrls(videoUrls) {
  const tempDir = path.join('temp');
  const mergedFilename = `merged-${uuidv4()}.mp4`;
  const mergedPath = path.join(tempDir, mergedFilename);

  // Téléchargement des vidéos dans temp/
  const downloadedPaths = [];
  for (let i = 0; i < videoUrls.length; i++) {
    const url = videoUrls[i];
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
    });

    const tempFilePath = path.join(tempDir, `video_${i}.mp4`);
    const writer = fs.createWriteStream(tempFilePath);

    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    downloadedPaths.push(tempFilePath);
  }

  // Fusion des vidéos avec FFmpeg
  await new Promise((resolve, reject) => {
    const command = ffmpeg();

    downloadedPaths.forEach(file => {
      command.input(file);
    });

    command
      .on('error', reject)
      .on('end', resolve)
      .mergeToFile(mergedPath);
  });

  return `/temp/${mergedFilename}`;
}
