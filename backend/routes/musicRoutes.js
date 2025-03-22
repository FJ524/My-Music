import express from "express";
import { getMusic, createMusic } from "../controllers/musicController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMusic);
router.post('/create', protect, createMusic);

export default router;
