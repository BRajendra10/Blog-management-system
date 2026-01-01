import express from 'express';
import connectDB from './db/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

connectDB();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

import userRouter from './routes/user.route.js';
import blogRouter from './routes/blog.route.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter)

app.use((err, req, res, next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors
        })
    }

    res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal server Error",
        errors: []
    })
})

app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`)
})