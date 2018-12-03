#!/usr/bin/env sh

set -ex

node uglify.js
cp package.json ./dist
cp package-lock.json ./dist
cd ./dist
sed -i '-backup' 's/"private": true,/"private": false,/g' package.json
sed -i '-backup' 's/"name": "@appliedblockchain\/mantle",/"name": "@appliedblockchain\/mantle-core",/g' package.json
rm package.json-backup
npm i