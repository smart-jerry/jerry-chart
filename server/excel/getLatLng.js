var fs = require('fs')
var path = require('path')
var xlsx = require('node-xlsx').default

const excelNames = require('./getExcelName')
let allData = {}

// console.log(path.resolve(__dirname, `t.json`), 9)
for (const name of excelNames) {
  let obj = {}
  let workSheetsFromBuffer = xlsx.parse(
    fs.readFileSync(`${__dirname}/${name}.xlsx`)
  )
  //   console.log(workSheetsFromBuffer[0].data[0], 89)
  let excelData = workSheetsFromBuffer[0].data
  let documentData = []
  for (let item of excelData.slice(1)) {
    let lat_lng = item[2].split(',')
    // console.log(lat_lng, 11)
    documentData.push(parseFloat(lat_lng[0]), parseFloat(lat_lng[1]))
    // console.log(documentData, 11)
  }

  obj[name] = documentData
  console.log(name, documentData.length, 99)
  allData[name] = documentData
  fs.writeFile(
    path.resolve(__dirname, `${name}.json`),
    JSON.stringify(obj),
    function(err) {
      if (err) {
        return console.error(err)
      }
      console.log(`数据写入 ${name}.json 成功！`)
    }
  )
}
