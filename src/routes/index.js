// src/routes/index.js

import { Router } from 'express';
import adminRouter from './admin.router.js';
import userRouter from './user.router.js';

const router = Router();

// ✅ Admin routes
router.use('/admin', adminRouter);

// ✅ User or application routes (Fint)
router.use('/fint', userRouter);



// 🚀 Export main router
export default router;
