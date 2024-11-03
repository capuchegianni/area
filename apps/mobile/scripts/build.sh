#!/bin/bash

##
## Entrypoint for the mobile Dockerfile.
## It builds the Android APK and copies it to the frontend directory using shared volume.
##

SOURCE_FILE="/tmp/app/apps/mobile/client.apk"
CLIENT_DESTINATION_FILE="/app/apps/frontend/build/client/apk/client.apk"
SERVER_DESTINATION_FILE="/app/apps/frontend/static/apk/client.apk"

npm run build:local

mkdir -p "$(dirname $CLIENT_DESTINATION_FILE)"

cp $SOURCE_FILE $CLIENT_DESTINATION_FILE

mkdir -p "$(dirname $SERVER_DESTINATION_FILE)"

cp $SOURCE_FILE $SERVER_DESTINATION_FILE
