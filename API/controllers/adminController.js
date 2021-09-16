const { uploadPath, maximumFileSize } = require('./constants');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const multerConfig = require('./../config/multer');
const Post = require('../models/Post');
const validator = require('validator');
const logger = require('../config/logger');
const Comment = require('../models/Comment');
const { CommentStatus } = require('../models/constants');


exports.createPost = async (req, res) => {

    //TODO: specify what types of file should be uploaded
    const validFileTypes = ['png', 'jpeg', 'jpg'];
    const upPath = path.join(uploadPath, 'posts/photos')
    const upload = multerConfig(upPath, maximumFileSize, validFileTypes);

    upload.single('photo')(req, res, async function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({ message: `File is larger than ${maximumFileSize / (1024 * 1024)}MB` });
                }
            }
            return res.status(406).json({ message: err.message || err.msg || 'Upload failed' });
        }

        if (!req.file) {
            return res.status(500).json({ message: 'Upload failed!' });
        }

        const { title, caption } = req.body;
        if (!(title && caption)) {
            return res.status(400).json({ message: 'all input is required!' });
        }

        try {
            //post fields:
            // title
            // caption
            // photo
            // comments
            // creator
            const photoName = req.file.filename;
            const creator = req.user._id;
            const post = new Post({
                title, caption, creator,
                photo: photoName
            });

            await post.save();

            logger.info('post created successfuly!')
            return res.status(201).json({ post, message: 'post uploaded successfully!' });
        } catch (err) {
            logger.error(err.message);
            return res.status(500).json({ message: `Database error: ${err.message}` });
        }
    });
}


exports.editPost = async (req, res) => {

    const { fieldsToUpdate } = req.body;
    const { postId } = req.params;

    if (!(fieldsToUpdate && postId)) {
        return res.status(400).json({ message: 'fieldsToUpdate and postId are required' });
    }

    const { caption, title } = fieldsToUpdate;

    if (!(caption || title)) {
        return res.status(400).json({ message: 'fieldsToUpdate is required' });
    }

    if (!validator.isMongoId(postId)) {
        return res.status(400).json({ message: 'postId is not valid' });
    }

    try {

        const id = mongoose.Types.ObjectId(postId);
        const post = await Post.findOneAndSelectAll({ _id: id });
        if (!post) {
            return res.status(404).end();
        }

        if (caption) {
            post.caption = caption;
        }
        if (title) {
            post.title = title;
        }

        await post.save();

        return res.status(200).json({ post: post.toObject() });
    } catch (err) {
        logger.error(err.msg || err.message || JSON.stringify(err));
        res.status(500).json({ message: 'Database error!' });
    }
}

exports.editPostPhoto = async (req, res) => {

    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ message: 'postId is required' });
    }

    if (!validator.isMongoId(postId)) {
        return res.status(400).json({ message: 'postId is not valid' });
    }
    try {
        const id = mongoose.Types.ObjectId(postId)
        const post = await Post.findOneAndSelectAll({ _id: id });

        if (!post) {
            return res.status(404).end();
        }

        const validFileTypes = ['png', 'jpeg'];
        const upPath = path.join(uploadPath, 'posts/photos')
        const upload = multerConfig(upPath, maximumFileSize, validFileTypes);

        upload.single('photo')(req, res, async function (err) {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(413).json({ message: `File is larger than ${maximumFileSize / (1024 * 1024)}MB` });
                    }
                }
                return res.status(406).json({ message: err.message || err.msg || 'Upload failed' });
            }

            if (!req.file) {
                return res.status(500).json({ message: 'Upload failed!' });
            }

            //means successfull upload!
            logger.info('file uploaded!');

            const photoName = req.file.filename;

            //push current post photo into prevPhotos and then update the current photo
            post.prevPhotos.push(post.photo);

            post.photo = photoName;
            await post.save();

            return res.status(200).json({ post: post.toObject() });
        })
    } catch (err) {
        logger.error(err.message || err.msg || err);
        return res.status(500).json({ message: 'Database error!' });
    }
}


//TODO: delete all comments related to that post
exports.deleteOnePost = async (req, res) => {

    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({ message: 'postId is required!' });
    }

    if (!validator.isMongoId(postId)) {
        return res.status(400).json({ message: 'postId is not valid!' });
    }

    try {
        const deletedPost = await Post.findByIdAndDelete(postId);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found!' });
        }
        return res.status(200).json({ message: 'Post deleted successfully!' });

    } catch (err) {
        logger.error(err.message || err.msg || JSON.stringify(err))
        return res.status(500).json({ message: 'Database error!' });
    }
}

//TODO: handle status comment when getting post
exports.confirmComment = async (req, res) => {

    const { commentId } = req.params;

    if (!commentId) {
        return res.status(400).json({ message: 'Comment id is required!' });
    }
    if (!validator.isMongoId(commentId)) {
        return res.status(400).json({ message: 'Comment id is not valid' });
    }

    const { status } = req.query;

    if (!status) {
        return res.status(400).json({ message: 'Comment status is required' });
    }

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found!' });
        }
        comment.status = status;

        await comment.save();

        return res.status(200).json({ message: `Comment status changed to ${status}!` });
    } catch (err) {
        logger.error(err.message || err.msg || JSON.stringify(err));
        return res.status(500).json({ message: err.message || err.msg || 'Database error' });
    }
}


exports.getComments = async (req, res) => {

    let { status } = req.query;

    try {

        const findOpiton = {};
        if (status && (status === CommentStatus.ACCEPTED || status === CommentStatus.PENDING || status === CommentStatus.REJECTED)) {
            findOpiton.status = status;
        }

        const populatePost = {
            path: 'post',
            select: '-__v -comments',
        }
        const populateUser = {
            path: 'user',
            select: '-__v -createdAt -updatedAt'
        }

        const comments = await Comment.find(findOpiton)
            .populate(populatePost)
            .populate(populateUser)
            .lean();

        return res.status(200).json({ comments, });
    } catch (err) {
        logger.error(err.message || err.msg || JSON.stringify(err));
        return res.status(500).json({ message: err.message || err.msg || 'Database error' });
    }
}