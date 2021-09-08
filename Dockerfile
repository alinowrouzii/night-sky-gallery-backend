FROM node:15
WORKDIR /app
COPY package.json .

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . ./

# Remove the default Nginx configuration file
# RUN rm -v /etc/nginx/nginx.conf

# Copy a configuration file from the current directory
ADD /nginx/default.conf /etc/nginx/

ADD error_pages /usr/share/nginx/html/
ADD error_pages /var/www/html/


ENV PORT 3000
EXPOSE $PORT
CMD ["node", "index.js"]