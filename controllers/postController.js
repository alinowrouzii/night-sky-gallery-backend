
const { uploadPath, maximumFileSize } = require('./constants');
const path = require('path');
const mime = require('mime-types');
const fse = require('fs-extra');

const multer = require('multer');
const multerConfig = require('./../config/multer');
const Post = require('../models/Post');
const logger = require('../config/logger');

exports.createPost = async (req, res) => {

    //TODO: specify what types of file should be uploaded
    const validFileTypes = ['png', 'jpeg'];
    const upPath = path.join(uploadPath, 'posts/photos')
    const upload = multerConfig(upPath, maximumFileSize, validFileTypes);

    upload.single('photo')(req, res, async function (err) {
        if (err) {
            logger.error(err.message || err.msg);
            if (err instanceof multer.MulterError) {
                return res.status(406).json({ message: `upload failed! due to an error: ${err.message}` });
            }

            if (err.msg === 'File too large') {
                return res.status(413).json({ message: `File is larger than ${maximumFileSize / (1024 * 1024)}MB` });
            }
            return res.status(406).json({ message: `upload failed! due to an error: ${err.message || err.msg}` });
        }

        if (!req.file) {
            return res.status(500).json({ message: 'Upload failed!' });
        }

        //means successfull upload!
        logger.info('file uploaded!');

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
