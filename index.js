import express from 'express';
import { mergeVideosFromUrls } from './utils/mergeVideos.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/temp', express.static(path.join('temp'))); // Serve static files from /temp

app.get('/', (req, res) => {
  res.send('👋 Welcome to the Video Merge API');
});

app.post('/merge', async (req, res) => {
  const { videoUrls } = req.body;

  if (!Array.isArray(videoUrls) || videoUrls.length === 0) {
    return res.status(400).json({ error: 'Invalid input: Provide an array of video URLs.' });
  }

  const outputFilename = `merged-${uuidv4()}.mp4`;
  const outputPath = path.join('temp', outputFilename);

  // 🔁 Répond immédiatement pour éviter timeout côté n8n
  res.status(202).json({
    success: true,
    status: 'processing',
    mergedVideoUrl: `/temp/${outputFilename}`
  });

  // 💻 Fusion en arrière-plan
  try {
    await mergeVideosFromUrls(videoUrls, outputPath);
    console.log(`✅ Fusion terminée : ${outputFilename}`);
  } catch (error) {
    console.error('[❌ erreur fusion async]', error);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
