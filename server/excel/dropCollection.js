const excelNames = require('./getExcelName')

const dropCollection = function(db, callback) {
  excelNames.push('all')
  for (const name of excelNames) {
    db.dropCollection(name, function(err, result) {
      console.log(`Dropped ${name} collection form db`)
      callback(result)
    })
  }
}
module.exports = dropCollection
