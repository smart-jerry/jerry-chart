const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const bodyParser = require('body-parser')
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const dbconfig = require('./excel/dbconfig')
const client = new MongoClient(dbconfig.url)
// const countDocument = require('./excel/countDocument')
const countDocument = require('./countDocument')
const findDocument = require('./excel/findDocument')
app.set('port', port)
// app.use(bodyParser.json()) // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const indexMark = require('./index-mark')
app.use('/', [indexMark]);
// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
let db

config.dev = !(process.env.NODE_ENV === 'production')

app.post('/test', (req, res) => {
  console.log(req.body, 89)
  res.send('Hello World!')
})
app.post('/getCount', (req, res) => {
  console.log(req.body, 89)
  // console.log(db, 891)
  countDocument(db, req.body).then(dbres => {
    console.log(dbres, 9999)
    // client.close()
    res.send(dbres)
  })
})
async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
// client.connect((err, client) => {
//   assert.equal(null, err)

//   console.log('Connected successfully to server')
//   db = client.db(dbconfig.dbName)
// })
start()
