require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const userRoute = require('./routes/user.js');
const postRoute = require('./routes/post.js');
const authRoute = require('./routes/auth.js');
const adminRoute = require('./routes/admin.js');

const app = express();


app.use(express.json({ limit: '20mb', extended: true }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))
app.use(cors({
    // origin: '*',
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(cookieParser());


//mongoDB connection setup
const mongooseSetup = require('./config/mongooseSetup.js');
mongooseSetup();


// app.get('/',(req,res)=>{
//     console.log('hello')
// })

app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/auth', authRoute);
app.use('/admin', adminRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));
