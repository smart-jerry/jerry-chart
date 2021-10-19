const express = require('express')
var router = express.Router()
const dbconfig = require('./excel/dbconfig')
const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(dbconfig.url)

let config = {}
//将全局变量设置为不可删除、只读
Object.defineProperty(global, 'config', {
  value: config,
  writable: false,
  configurable: false
})

client.connect((err, client) => {
  console.log('Connected successfully to server')
  try {
    config.db = client.db(dbconfig.dbName)
  } catch (err) {
    console.log('failed to connect mongongdb.')
  }
})

router.post('/getTotal', (req, res) => {
  let reqb = req.body
  if (!config.db) {
    res.send({ totalNum: 0, result: '1' })
    return
  }
  config.db
    .collection(reqb.regionName)
    .find({})
    .count(function(err, result) {
      if (err) throw err
      console.log(result, 5123)
      res.send({ totalNum: result, result: '0' })
    })
})
router.post('/getMark', (req, res) => {
  //  console.log(req.body,'22222222222222222222222222');
  let reqb = req.body
  config.db
    .collection(reqb.regionName)
    .find({})
    .skip(reqb.skip || 0)
    .limit(reqb.limitNum || 10)
    .toArray(function(err, result) {
      // 返回集合中所有数据
      if (err) throw err
      //    console.log(result);
      res.send(result)
    })
})
module.exports = router
