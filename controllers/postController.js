
const { uploadPath, maximumFileSize } = require('./constants');
const path = require('path');
const mime = require('mime-types');
const fse = require('fs-extra');
const mongoose = require('mongoose');
const multer = require('multer');
const multerConfig = require('./../config/multer');
const Post = require('../models/Post');
const validator = require('validator');

const logger = require('../config/logger');

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
            const creator = req.user.user_id;
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

    const { fieldsToUpdate, postId } = req.body;

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


exports.getPosts = async (req, res) => {

    try {

        //TODO: add some limitation to fetch posts
        const posts = await Post.find().lean();

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
