const path = require('path');
const mime = require('mime-types');
const fse = require('fs-extra');
const Post = require('../models/Post');
const validator = require('validator');

const logger = require('../config/logger');
const { CommentStatus } = require('../models/constants');
const Comment = require('../models/Comment');

exports.getPosts = async (req, res) => {

    try {

        //TODO: add some limitation to fetch posts
        const posts = await Post.findAndPapulate();

        return res.status(200).json({ posts, });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ message: `Database error: ${err.message}` });
    }
}

exports.downloadPhoto = (req, res) => {

    const { photoName } = req.params;

    if (!photoName) {
        return res.status(400).json({ message: 'fileName is required!' });
    }

    const filePath = path.join(__dirname, '..', 'uploads/posts/photos', photoName);
    const mimetype = mime.lookup(filePath);


    fse.stat(filePath, function (err) {
        if (err === null) {
            res.setHeader('Content-disposition', 'attachment; filename=' + photoName);
            res.setHeader('Content-type', mimetype);

            const filestream = fse.createReadStream(filePath);
            filestream.pipe(res);
            return;
        } else if (err.code === 'ENOENT') {
            logger.error('Photo not found!!')
            return res.status(404).json({ message: 'Photo not found!' });
        } else {
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    })
}


exports.addCommentToPost = async (req, res) => {

    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({ message: 'post id is required!' });
    }
    if (!validator.isMongoId(postId)) {
        return res.status(400).json({ message: 'Post id is not valid' });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'text body is required!' });
    }

    try {
        //TODO: check that string postId accepted or not
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found!' });
        }

        const user = req.user._id;
        const comment = new Comment({
            text, user,
            status: CommentStatus.PENDING,
            post: postId
        });
        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        res.status(201).json({ message: 'Comment submitted! wait for confirmation' });
    } catch (err) {
        logger.error(err.message || err.msg || JSON.stringify(err));
        return res.status(500).json({ message: err.message || err.msg || 'Database error' });
    }
}