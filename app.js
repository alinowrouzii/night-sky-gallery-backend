require('dotenv').config();

const logger = require('./config/logger');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const userRoute = require('./routes/user.js');
const postRoute = require('./routes/post.js');
const authRoute = require('./routes/auth.js');
const adminRoute = require('./routes/admin.js');
const superAdminRouter = require('./routes/superAdmin.js')
const app = express();


app.use(express.json({ limit: '20mb', extended: true }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))
app.use(cors({
    // origin: '*',
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(cookieParser());


// app.get('/',(req,res)=>{
//     console.log('hello')
// })

app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/auth', authRoute);
app.use('/admin', adminRoute);
app.use('/superAdmin', superAdminRouter);


module.exports = app;
