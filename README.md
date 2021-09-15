
## This is Night sky gallery backend that is written by Node js.

## Modules [Backend] API
- [Express] - fast [node.js](https://nodejs.org/) network app framework
- [MongoDB] - to store data
- [jsonwebtoken] -  creating token for  authentication
- [Multer] - for file uploading
- [rate-limiter-flexible] - to prevent a brute force attack on the api
- [redis] - to store the users IP who have failed to login that is used in rate-limiter

## How to run API

At first you should Install the api dependencies and devDepenendencies and start the server.

You should install MongoDB and redis-server before.
```sh
cd night-sky-gallery-backend-master
npm i
sudo service redis-server start
mongod
npm run dev
```

   [Socket.io]: <https://socket.io/>
   [express]: <http://expressjs.com>
   [Passport-js]: <http://www.passportjs.org/>
   [MongoDB]: <https://www.mongodb.com/>
   [jsonwebtoken]: <https://github.com/auth0/node-jsonwebtoken>
   [Multer]: <https://github.com/expressjs/multer>
   [rate-limiter-flexible]: <https://github.com/animir/node-rate-limiter-flexible>
   [redis]: <https://redis.io/>
   
   
   ### API documentation is available at http://localhost:5000/api-docs
   
  
   # Docker
   
   ## for development purpose:
   
   to build an image:
  ```sh
   docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml build
  ```
  
  to create container from that image:
  ```sh
   docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
  ```
  ##### To make sure that container is running correctly, check : http://localhost:8080/ping
  
 ## for production purpose:

to build an image:
  ```sh
   docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml build
  ```
  
  to create container from that image:
  ```sh
   docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
  ```
### Before running the container in production some Environment variable should be set:
- MONGO_INITDB_ROOT_USERNAME 
- MONGO_INITDB_ROOT_PASSWORD\
    These are username and password that can access the MongoDB inside the container
- MONGO_USER
- MONGO_PASSWORD\
  These two username and password must be the same as the previous root username and password


 
  