console.log(" =========================== ")
console.log(" ========= MYWORLD ========= ")
console.log(" =========================== ")

const tileserver = "../../GIS/tiles"
console.log("TileServer", __dirname, tileserver);

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const session = require('express-session');

var ejs = require('ejs');
const path = require('path');
var bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '15mb' }));
//app.use(bodyParser.urlencoded({limit: '5mb'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

app.use(session({
  secret: "wartorn",
  name: "sid",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: THIRTY_DAYS, }
}));

app.use(express.static(path.join(__dirname, '../public')));
// assets folder
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/tiles', express.static(path.join(__dirname, tileserver)));

app.use('/recording', require('./recordingRouter'));
app.use('/player', require('./playerRouter'));


console.log("Checking mode:");
/*
if (process.env.NODE_ENV === 'development') {
  console.log("Development mode");
  var livereload = require('livereload');

  var liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, '../public'));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 1000);
  });
  app.use(require('connect-livereload')({
    port: 35729
  }));
}*/


app.listen(4200, () => {
  console.log('Server listening on port 4200');
  console.log("TileServer", __dirname, tileserver);
});