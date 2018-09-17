// server.js
// where your node app starts
// YES, YOU CAN EDIT

const Promise = require('bluebird');
const express = require('express');
const hljs = require('highlight.js');
const fs = Promise.promisifyAll(require('fs'));
const sqlite3 = require('./promise-sqlite3');
const fetch = require('node-fetch');
const { hours, minutes } = require('millis');
const commonmark = require('commonmark');

const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
const db = new sqlite3.Database(dbFile); 
const CleanCss = require('clean-css');

db.serialize(() => {
  if (!exists) {
    /*
    db.run('CREATE TABLE Paste (' +
             'rowid INTEGER PRIMARY KEY AUTOINCREMENT,' +
             'content TEXT,' + 
             'language TEXT,' +
             'ts INTEGER)');
     */
  }
});

const app = express();
app.use((request, response, next) => {
  if (!request.get('user-agent').includes('UptimeRobot')) {
    console.log(`${new Date()}: ${request.method} ${request.originalUrl}` + 
      ` - ${request.get('x-forwarded-for')} - ${request.get('User-Agent')}`);
  }
  next();
});
app.use(express.static('public', {maxAge: '30m'}));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'pug');
app.disable('view cache'); // pages are cached anyway

async function loadCss() {
  let normalizeCss = await fs.readFileAsync('public/normalize.css');
  let styleCss = await fs.readFileAsync('public/style.css');  
  return new CleanCss({}).minify(normalizeCss + styleCss).styles;
}

async function render(request, response, options) {
  let devMode = !('x-forwarded-uri' in request.headers);
  let css = await loadCss();
  if (!devMode) {
    response.setHeader('Cache-Control', `public, max-age=${minutes(30)/1000}`);
  }
  response.render('app', {css, devMode, ...options});
}

app.get('/', async (request, response) => {
  render(request, response, {});
});

function cleanup() {
  db.run('DELETE FROM Paste WHERE ts < ?',
         new Date().getTime() - hours(24));
  setTimeout(cleanup,  hours(24));
}
cleanup();

async function refreshExternalCache() {
  const result = await fetch('https://paste.ga/');
  const text = await result.text();
  setTimeout(refreshExternalCache, minutes(5));
}
refreshExternalCache();

var listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
