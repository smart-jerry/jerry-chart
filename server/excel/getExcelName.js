const fs = require('fs')
const path = require('path')
const assert = require('assert')
let excelNames = []
let fileNameWithoutExtName
let files = fs.readdirSync(`${__dirname}`)
files.forEach(function(file) {
  let extName = path.extname(file)
  //   console.log(extName, 89)
  if (extName.substring(1) === 'xlsx') {
    fileNameWithoutExtName = file.substring(0, file.indexOf('.'))
    excelNames.push(fileNameWithoutExtName)
  }
})
console.log(
  excelNames,
  'there are ' + excelNames.length + ' xlsx files in excel directory'
)
module.exports = excelNames
