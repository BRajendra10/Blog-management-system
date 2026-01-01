import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnImageKit } from "../utils/imagekit.js";

const createBlog = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (!req.file?.path) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnailUpload = await uploadOnImageKit(req.file.path);

    if (!thumbnailUpload) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    const blog = await Blog.create({
        title,
        description,
        thumbnail: thumbnailUpload.url,
        thumbnailFileId: thumbnailUpload.fileId,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, blog, "Blog created successfully")
    );
});

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find()
        .populate("owner", "username avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, blogs, "Blogs fetched successfully")
        );
});

const getBlogById = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId)
        .populate("owner", "username email");

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, blog, "Blog fetched successfully")
        );
});

const updateBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { title, description } = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Ownership check
    if (blog.owner !== req.user._id) {
        throw new ApiError(403, "You are not allowed to update this blog");
    }

    if (title) blog.title = title;
    if (description) blog.description = description;

    // If new thumbnail provided
    if (req.file?.path) {
        const thumbnailUpload = await uploadOnImageKit(req.file.path);

        if (!thumbnailUpload) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        // delete old thumbnail
        await deleteOnImageKit(blog.thumbnailFileId);

        blog.thumbnail = thumbnailUpload.url;
        blog.thumbnailFileId = thumbnailUpload.fileId;
    }

    await blog.save();

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog updated successfully")
    );
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Ownership check
    if (blog.owner !== req.user._id) {
        throw new ApiError(403, "You are not allowed to delete this blog");
    }

    await blog.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Blog deleted successfully")
        );
});

export {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};
