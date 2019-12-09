 const insertDocuments = require('./insertDocuments')
const dropCollection = require('./dropCollection.js')
const indexCollection = require('./indexCollection')
const findDocument = require('./findDocument')
const countDocument = require('./countDocument')

const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const config = require('./dbconfig')
const client = new MongoClient(config.url)
// console.log(config, 89)

client.connect((err, client) => {
  assert.equal(null, err)
  console.log('Connected successfully to server')

  const db = client.db(config.dbName)
//   dropCollection(db, function() {
//     client.close()
//   })


//  insertDocuments(db, function () {
//    console.log('insert is successful done!')
//    client.close()
//  })

  countDocument(db, function() {
    console.log('task is successful done!')
    client.close()
  })
  
  // indexCollection(db, function() {
  //   client.close()
  // })

  // findDocument(db, function() {
  //   client.close()
  // })
})

// const findDocuments = function(db, callback) {
//   // Get the documents collection
//   const collection = db.collection(collectionName)
//   // Find some documents
//   collection.find({ a: 3 }).toArray(function(err, docs) {
//     assert.equal(err, null)
//     console.log('Found the following records')
//     console.log(docs)
//     callback(docs)
//   })
// }
