rm -rf node_modules package*.json
npm install -g webpack-cli
npm install webpack webpack-cli --save-dev
npm install youtubei.js@6.4.1
rm -rf dist/*
npx webpack
