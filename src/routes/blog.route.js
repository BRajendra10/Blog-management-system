import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from '../controllers/blog.controller.js';

const router = Router();

router.route("/").get(verifyJWT, getAllBlogs)
router.route("/create").post(verifyJWT, upload.single("thumbnail"), createBlog)
router.route("/blog/:blogId").get(verifyJWT, getBlogById);
router.route("/update/:blogId").patch(verifyJWT, upload.single("thumbnail"), updateBlog)
router.route("/delete/:blogId").delete(verifyJWT, deleteBlog)

export default router;