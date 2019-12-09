const assert = require('assert')

const excelNames = require('./getExcelName')
const allData = require('./getExcelData')

const insertDocuments = function(db, callback) {
  let collectionAll = db.collection('all')
  for (const name of excelNames) {
    let collection = db.collection(name)
    Promise.all([
      collection.insertMany(allData[name]),
      collectionAll.insertMany(allData[name])
    ])
      .then((separatResult, allResult) => {
        console.log(separatResult, 3)
        console.log(allResult, 4)
        assert.equal(separatResult[0], null)
        assert.equal(allResult[0], null)
        console.log(
          `Inserted ${
            separatResult[1].result.n
          } documents into the '${name}' collection`
        )
        console.log(
          `Inserted ${
            allResult[1].result.n
          } documents into the 'all' collection!!`
        )
        callback(resultArr)
      })
      .catch(err => {
        console.error(err)
      })
    // collection.insertMany(allData[name], function(err, result) {
    //   assert.equal(err, null)
    //   //   assert.equal(3, result.result.n)
    //   //   assert.equal(3, result.ops.length)
    //   console.log(
    //     `Inserted ${result.result.n} documents into the '${name}' collection`
    //   )
    //   callback(result)
    // })
    // collectionAll.insertMany(allData[name], function(err, result) {
    //   assert.equal(err, null)
    //   console.log(
    //     `Inserted ${result.result.n} documents into the 'all' collection`
    //   )
    //   callback(result)
    // })
  }
}
module.exports = insertDocuments
