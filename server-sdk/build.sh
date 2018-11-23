#!/usr/bin/env sh

set -ex

node uglify.js
cp package.json ./dist
cd ./dist
sed -i '-backup' 's/"private": true,/"private": false,/g' package.json
rm package.json-backup
npm i