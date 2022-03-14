/*

  website where dashboard will be embedded: 
  https://bipp-de-dev.herokuapp.com/


  Note: username, password authentication for the website 'https://bipp-de-dev.herokuapp.com/' 
  is beyond the scope of this demo. We are simply showing that once the login process to 
  the website is complete, how to dynamically generate embed link based on user 
  attributes e.g. name, email and then embed dashboard on the website
  */

const express = require('express');
const axios = require('axios');
const fs = require('fs');

const atob = (base64) => {
  return Buffer.from(base64, 'base64').toString('binary');
};
// username to customer_id mapping can be read from database or flat file
// for simplicity we are hardcoding it

const usersMap = {
  'demo1': 'AA-10315',
  'demo2': 'AA-10375',
  'demo3': 'AA-10480',
  'demo4': 'AA-10645',
  'demo5': 'AB-10015',
}

function getCustomerId(uname) {
  if (usersMap[uname]) {
    return usersMap[uname];
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
  embedHandler(req, res, originalText);
});

/*
  Generate embed link dynamically by passing dashboard_id and customer specific filters
*/
function generateEmbedLink(customerId, callback) {

  const orgID = 'O~dpw5fJ-S4';
  const bippURL = 'https://app.bipp.io';  // bipp server URL

  const appID = 'd61dd7fd-792b-4beb-aff4-a3129d96312e';
  const apiKey = 'laxqgqhewvgdiwfh7xex6oro0plx73owwaw4hntnvtu2zj77';

  const table = 'Superstore_Orders';
  const column = 'Customer_ID';
  const dashboardId = 'D~kxIH9iyhN';

  // Whitelisted domains, only following domains will be able to show embed dashboard
  const domains = ['localhost:9000', 'https://bipp-de-dev.herokuapp.com'];

  // Bipp API end point
  const url = `${bippURL}/app/v1/extapps/${appID}/embed/generate-link`;

  // We are using customerId filter here, other filters can also be used

  const filters = [
    {
      table,
      column,
      comparator: "=",
      value: customerId
    }
  ];

  // Call bipp rest API to generate embed link
  axios
    .post(
      url,
      {
        id: dashboardId,
        domains,
        filters,
        description: 'Embed Link for Customer : ' + customerId,
      },
      {
        headers: {
          'X-API-Key': apiKey,
          'X-Org-ID': orgID,
        },
      }
    )
    .then(function (response) {
      const { embed_url } = response.data;
      callback(embed_url);
    })
    .catch(function (error) {
      console.log(error);
    });
}

app.get('/dashboard', (req, res) => {

  // Note: username, password authentication is beyond the scope of this demo
  // We are simply showing that once the login process to the website is complete
  // how to dynamically generate embed link based on user attributes e.g. name, email
  // and embed dashboard on the website

  let uname = req.query['user']
  let pwd = req.query['pwd']

  // identify customerId from the username
  let customerId = getCustomerId(uname);

  if (!customerId) {
    res.send('<h1>Invalid User</h1>');
    return;
  }

  generateEmbedLink(customerId, (embed_url) => {

    // sample.html has the basic embed snippet, just replace the <dummy_link> with
    // the generated embed link

    fs.readFile('sample.html', 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      let ndata = data.replace('<dummy_link>', embed_url);
      res.send(ndata);
    })
  });
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