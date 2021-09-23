#!/usr/bin/env bash

# FILE_PATH="db/logfile.log"
# if [ ! -f "$FILE_PATH" ]; then
#   mkdir -p "${FILE_PATH%/*}" && touch "$FILE_PATH"
# fi
# mongod --shutdown

# mongod --fork --logpath db/logfile.log --logappend
sudo service mongod start
sudo service redis-server start
nodemon index.js