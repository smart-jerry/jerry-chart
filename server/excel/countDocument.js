const assert = require('assert')
// const excelNames = require('./getExcelName')

const countDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('all')
  collection
    .find({
      lat: { $gte: 24.6922868, $lte: 24.7268938 },
      lng: { $gte: 46.6295794, $lte: 46.641858 }
    })
    .count(function(err, docs) {
      assert.equal(err, null)
      // console.log(`Found the following ${docs.length} records`)
      console.log(docs)
      callback(docs)
    })
}
module.exports = countDocuments
