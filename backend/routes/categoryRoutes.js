import express from "express";
import { getCategories, createCategory } from "../controllers/categoryController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCategories);
router.post('/create', protect, createCategory);

export default router;
