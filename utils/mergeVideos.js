import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Fonction utilitaire pour télécharger une vidéo temporairement
async function downloadVideo(url, filename) {
  const res = await fetch(url);
  const dest = fs.createWriteStream(filename);
  return new Promise((resolve, reject) => {
    res.body.pipe(dest);
    res.body.on('error', reject);
    dest.on('finish', () => resolve(filename));
  });
}

// Fonction principale pour fusionner les vidéos
export async function mergeVideosFromUrls(urls) {
  const tempDir = './temp';
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const localFiles = await Promise.all(
    urls.map(async (url, i) => {
      const filePath = path.join(tempDir, `input_${i}.mp4`);
      await downloadVideo(url, filePath);
      return filePath;
    })
  );

  const outputFile = path.join(tempDir, `merged-${uuidv4()}.mp4`);
  const merged = ffmpeg();

  localFiles.forEach(file => merged.input(file));

  return new Promise((resolve, reject) => {
    merged
      .on('error', reject)
      .on('end', () => resolve(outputFile))
      .mergeToFile(outputFile);
  });
}
