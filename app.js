require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const userRoute = require('./routes/user.js');
const postRoute = require('./routes/post.js');
const authRoute = require('./routes/auth.js');
const adminRoute = require('./routes/admin.js');
const superAdminRouter = require('./routes/superAdmin.js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

app.use(express.json({ limit: '20mb', extended: true }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))
app.use(cors({
  // origin: '*',
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(cookieParser());
app.use('trust proxy')

app.get('/ping',(req,res)=>{
    res.send('pong')
})

app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/auth', authRoute);
app.use('/admin/post', adminRoute);
app.use('/superAdmin', superAdminRouter);

var options = {
  explorer: true
};
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));


module.exports = app;
