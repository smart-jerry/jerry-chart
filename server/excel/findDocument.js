const assert = require('assert')
// const excelNames = require('./getExcelName')

const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('all')
  collection
    .find({
      lat: { $gte: 24.6922868, $lte: 24.7268938 },
      lng: { $gte: 46.6295794, $lte: 46.641858 }
    })
    .toArray(function(err, docs) {
      assert.equal(err, null)
      console.log(`Found the following ${docs.length} records`)
      console.log(docs, 345)
      callback(docs)
    })

  // const collection = db.collection('all')
  // collection.find({}).toArray(function(err, docs) {
  //   assert.equal(err, null)
  //   console.log(`Found the following ${docs.length} records`)
  //   console.log(docs)
  //   callback(docs)
  // })
}
module.exports = findDocuments
