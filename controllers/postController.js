
const { uploadPath, maximumFileSize } = require('./constants');
const path = require('path');
const mime = require('mime-types');
const fse = require('fs-extra');

const multer = require('multer');
const multerConfig = require('./../config/multer');
const Post = require('../models/Post');
const upload = multerConfig(uploadPath, maximumFileSize, ['png', 'jpeg', 'txt', 'pdf']);

exports.createPost = async (req, res) => {
    console.log(req.body);
    // const upload = multer({ dest: uploadPath });
    upload.single('new-post')(req, res, async function (err) {
        if (err) {
            console.log(err.message || err.msg);
            if (err instanceof multer.MulterError) {
                console.log('1');

                return res.status(406).json({ message: `upload failed! due to an error: ${err.message}` });
            }

            if (err.msg === 'File too large') {
                return res.status(413).json({ message: `File is larger than ${maximumFileSize / (1024 * 1024)}MB` });
            }
            return res.status(406).json({ message: `upload failed! due to an error: ${err.message || err.msg}` });
        }
        //means successfull upload!
        console.log('file uploaded!');

        if (!req.file) {
            return res.status.json({ message: 'Upload failed!' });
        }

        const photoPath = req.file.path;
        const name = req.body.name;
        const description = req.body.description;

        if (!(name && description)) {
            return res.status(400).json({ message: 'all input is required!' });
        }
        try {
            const post = new Post({ name, description, photoPath });

            await post.save();
            // console.log(req.body);
            // console.log(req.file);

            console.log('post created successfuly!')
            return res.status(201).json({ post, message: 'post uploaded successfully!' });
        } catch (err) {
            console.log(err);
            return res.status(409).json({ message: `Database error: ${err.message}` });
        }
    });

}

exports.getPost = async (req, res) => {

}


exports.downloadPhoto = (req, res) => {

    const { filePath } = req.body;

    if (!filePath) {
        return res.status(400).json({ message: 'filePath is required!' });
    }
    const file = __dirname + '\\..\\' + filePath;

    console.log(file);
    const filename = path.basename(file);
    const mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    const filestream = fse.createReadStream(file);
    filestream.pipe(res);

}
