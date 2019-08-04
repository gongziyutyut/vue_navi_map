const qiniu = require('qiniu')
const glob = require('glob')
const mime = require('mime')
const path = require('path')

const isWindow = /^window/.test(process.platform)
let pre = path.resolve(__dirname, '../dist') + (isWindow ? '\\' : '')
console.log(pre)
//同步获取匹配文件列表
glob