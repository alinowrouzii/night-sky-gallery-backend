
const { uploadPath, maximumFileSize } = require('./constants');
const multer = require('multer');
const multerConfig = require('./../config/multer');
const Post = require('../models/Post');
const upload = multerConfig(uploadPath, maximumFileSize, false, ['png', 'jpeg', 'txt', 'pdf']);

exports.createPost = async (req, res) => {
    console.log(req.body);
    // const upload = multer({ dest: uploadPath });
    upload.single('new-post')(req, res, async function (err) {
        if (err) {
            console.log(err.message || err.msg);
            if (err instanceof multer.MulterError) {
                console.log('1');
                //return something
                return res.status(406).json({ message: `upload failed! due to an error: ${err.message}` });
            }

            if (err.msg === 'File too large') {
                return res.status(413).json({ message: `File is larger than ${maximumFileSize / (1024 * 1024)}MB` });
            }
            return res.status(406).json({ message: `upload failed! due to an error: ${err.message || err.msg}` });
        }
        //means successfull upload!
        console.log('file uploaded!');

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
            return res.status(201).json({ message: 'post uploaded successfully!' });
        } catch (err) {
            console.log(err);
            return res.status(409).json({ message: `Database error: ${err.message}` });
        }
    });

}

exports.getPost = async (req, res) => {

}

