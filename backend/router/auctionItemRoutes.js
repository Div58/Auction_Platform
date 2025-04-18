import {addNewAuctionItem} from '../controllers/auctionItemController.js';
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
const router = express.Router();
router.post("/create", isAuthenticated, addNewAuctionItem);
export default router;