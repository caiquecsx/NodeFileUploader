const express = require('express')
const app = express()

const fileUpload = require('express-fileupload');
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var uploadDir = 'uploads/'
var userCpf;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log();
    mkdirIfNotExists(uploadDir+userCpf).then( () => {
      cb(null, uploadDir+userCpf)
    }).catch(err => {
      console.log(JSON.stringify(err))
      cb(null, uploadDir)
    })
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+".jpg")
  }
})

var upload = multer({ storage: storage })

var checkIfDirectoryExists = function(dirPath, successCallback, errorCallback) {
  try {
      var stats = fs.lstatSync(dirPath)

      if (stats.isDirectory()) {
          successCallback()
      }
  } catch (e) {
      errorCallback()
  }
}

var mkdirIfNotExists = function(dirPath) {
  return new Promise(function(resolve, reject) {
      checkIfDirectoryExists(dirPath, function() {
          resolve()
      }, function() {
          fs.mkdirSync(dirPath);
          resolve()
      })
  })
}

app.use(express.static('/public'))
app.post('/', upload.any(), (req, res) => {
  userCpf = req.body.cpf
   res.sendFile(__dirname +'/public/upload.html');
})

app.get('/', (req, res) => {
  fs.readFile('uploads/envolvidos/envolvidos-1540320722434.jpg', (err, content) =>{
    if(err){
      res.end("file not found")
    }else{
      res.writeHead(200, {'Content-type': 'image/jpg'})
      res.end(content)
    }
  })
})

app.post('/upload', function(req, res) {
  console.log(Object.keys(req.files).length)
  console.log(req.body)

  let imageFile = req.files.imageFile;
  let upDir = "uploads/" + req.body.cpf + '/' + req.body.id_bateu

  mkdirIfNotExists("uploads/" + req.body.cpf).then( _ => {
    mkdirIfNotExists(upDir).then( () => {
      imageFile.mv(__dirname + "/" + upDir + "/" + imageFile.name , err => {
        if(err){
          console.log(err)
        }
      })
    }).catch(err => {
      console.log(err)
    })
    
    res.send("File Received");
  });
})
  

let port = 8081;
app.listen(port, function() {
    console.log('Running on port: ' + port);
});