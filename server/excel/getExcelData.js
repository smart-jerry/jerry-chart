var fs = require('fs')
var path = require('path')
var xlsx = require('node-xlsx').default

const excelNames = require('./getExcelName')
let allData = {}
for (const name of excelNames) {
  let workSheetsFromBuffer = xlsx.parse(
    fs.readFileSync(`${__dirname}/${name}.xlsx`)
  )
  //   console.log(workSheetsFromBuffer[0].data[0], 89)
  let excelData = workSheetsFromBuffer[0].data
  let documentData = []
  for (let item of excelData.slice(1)) {
    let obj = {}
    let lat_lng = item[2].split(',')
    obj['user_id'] = item[0]
    obj['region_name'] = item[1]
    obj['lat'] = parseFloat(lat_lng[0])
    obj['lng'] = parseFloat(lat_lng[1])
    documentData.push(obj)
    // console.log(obj, 11)
  }
  allData[name] = documentData
}
console.log(allData, 'all data convert to object in xlsx files')
module.exports = allData
