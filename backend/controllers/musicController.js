import Music from "../models/Music.js";

// @desc    Get all music with category details
// @route   GET /api/music
// @access  Public
const getMusic = async (req, res) => {
  try {
    const musicList = await Music.find().populate("category", "name description");
    res.json(musicList);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createMusic = async (req, res) => {
  const { title, artist, category, fileUrl, duration, releaseDate } = req.body;

  if (!title || !artist || !category || !fileUrl) {
    return res.status(400).json({ message: "All required fields must be provided." });
  }

  try {
    const music = await Music.create({
      title,
      artist,
      category,
      fileUrl,
      duration: duration || null, // Optional field
      releaseDate: releaseDate ? new Date(releaseDate) : null, // Convert to Date format
    });

    res.status(201).json(music);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



export { getMusic, createMusic };
