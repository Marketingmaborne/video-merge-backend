import express from 'express';
import { mergeVideosFromUrls } from './utils/mergeVideos.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ➕ Ceci permet de servir les fichiers fusionnés depuis /temp
app.use('/temp', express.static('temp'));

app.get('/', (req, res) => {
  res.send('👋 Welcome to the Video Merge API');
});

app.post('/merge', async (req, res) => {
  const { videoUrls } = req.body;

  if (!Array.isArray(videoUrls) || videoUrls.length === 0) {
    return res.status(400).json({ error: 'Invalid input: Provide an array of video URLs.' });
  }

  try {
    const outputUrl = await mergeVideosFromUrls(videoUrls);
    res.status(200).json({ success: true, mergedVideoUrl: outputUrl });
  } catch (error) {
    console.error('[❌ merge error]', error);
    res.status(500).json({ error: 'Failed to merge videos.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
