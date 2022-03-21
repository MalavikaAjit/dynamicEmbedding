

const express = require('express');
const axios = require('axios');
const fs = require('fs');

const atob = (base64) => {
  return Buffer.from(base64, 'base64').toString('binary');
};

const usersMap = {
  'jim': 'jim@123',

}

function getCustomerId(uname) {
  if (usersMap[uname]) {
    return usersMap[uname];
  }
  return null;
}
function getCustomerPwd(pwd) {
  if (usersMap[pwd]) {
    return usersMap[pwd];
  }
  return null;
}


const app = express();

const port = process.env.PORT || 9000;

app.get('/dashboard', (req, res) => {


  let session = req.query['session']
  console.log('session', session);
  let originalText = atob(session);
  console.log('org text', originalText);

  let uname = originalText.split('-')[0];
  let pwd = originalText.split('-')[1];

  // let uname = req.query['user']
  // let pwd = req.query['pwd']


  let customerId = getCustomerId(uname);
  let customerPwd = getCustomerPwd(pwd);

  if (!customerId) {
    res.send('<h1>Invalid User</h1>');
    return;
  }


  fs.readFile('sample.html', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    res.send(data);
  })
});


app.get("/", (req, res) => {
  fs.readFile('./login.html', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    res.send(data);
  })
});


app.use(express.static('public'));
app.use('/images', express.static(__dirname + '/Images'));

app.listen(port, function () {
  console.log('Running node server', 'on port ' + port);
});
