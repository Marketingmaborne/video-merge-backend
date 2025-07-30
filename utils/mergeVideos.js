import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { createWriteStream } from 'fs';

const TEMP_FOLDER = './temp';
await fs.mkdir(TEMP_FOLDER, { recursive: true });

export async function mergeVideosFromUrls(urls) {
  const localPaths = [];

  for (const [i, url] of urls.entries()) {
    const filename = `${TEMP_FOLDER}/video${i}.mp4`;
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    const writer = createWriteStream(filename);
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    localPaths.push(filename);
  }

  const outputFilename = `${TEMP_FOLDER}/merged-${uuidv4()}.mp4`;

  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    localPaths.forEach((path) => command.input(path));
    command
      .on('end', () => resolve(outputFilename))
      .on('error', reject)
      .mergeToFile(outputFilename);
  });
}
