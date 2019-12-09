const indexCollection = function(db, callback) {
  db.collection('all').createIndex({ lat: 1, lng: 1 }, null, function(
    err,
    results
  ) {
    console.log(results)
    callback()
  })
}
module.exports = indexCollection
