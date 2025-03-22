import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import multer from 'multer';
import cors from 'cors';
import File from './models/File.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;

connectDB();

const app = express();
app.use('/uploads', express.static('uploads'));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/music", musicRoutes);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = file.originalname.replace(/\s+/g, '-') + '-' + uniqueSuffix;
    return cb(null, filename);
  }
})
const upload = multer({ storage: storage })


if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, fileType } = req.body; // Get title and fileType from request body

    if (!req.file || !title || !fileType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['Song', 'Wave'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const newFile = new File({
      title,
      path: req.file.path, // Save file path
      fileType, // Save file type
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

app.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    const filesWithUrl = files.map(file => ({
      _id: file._id,
      title: file.title,
      fileType: file.fileType, // Include fileType in response
      downloadUrl: `http://localhost:5000/uploads/${file.path.split('/').pop()}`
    }));

    res.json(filesWithUrl);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching files' });
  }
});




app.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, 'uploads', file.path);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });

    // Delete the file record from MongoDB
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});


// Make sure express.json() middleware is also included
app.use(express.json());
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));