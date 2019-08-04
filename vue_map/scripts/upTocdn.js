const qiniu = require('qiniu')
const glob = require('glob')
const mime = require('mime')
const path = require('path')
const chalk = require('chalk')
const successLog = message => console.log(chalk.blue(message))
const errorLog = message => console.log(chalk.red(message))
const isWindow = /^win/.test(process.platform)
let pre = path.resolve(__dirname, '../dist/') + (isWindow ? '\\' : '')
// 同步获取匹配文件列表
const files = glob.sync(
  `${path.join(__dirname, '../dist/**/*.?(js|css|map|png|jpg|svg|woff|woff2|ttf|eot)')}`
)
pre = pre.replace(/\\/g, '/')
const options = {
  scope: ' my_public_cdn' // 空间对象名称
}
const config = {
  qiniu: {
    accessKey: 'JACkG3bFDCS6ZzWFw0OE4SDdUhUwgxKKWUcOiUZw',
    secretKey: 'Xfz_NwxmsJOujwK7siGlsfQAMIi-fWNbsOxRLDmR',
    bucket: options.scope,
    domin: 'http://pvm2crr1z.bkt.clouddn.com'
  }
}

let accessKey = config.qiniu.accessKey
let secretKey = config.qiniu.secretKey
let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
let putPolicy = new qiniu.rs.PutPolicy(options)
let uploadToken = putPolicy.uploadToken(mac)
let cf = new qiniu.conf.Config()
cf.zone = qiniu.zone.Zone_z1
let formUploader = new qiniu.form_up.FormUploader(cf)
async function uploadFileCDN (files) {
  files.map(async file => {
    const key = getFileKey(pre, file)
    try {
      await uploadFile(key, file)
      successLog(`上传成功key: ${key}`)
    } catch (err) {
      errorLog('error' + err)
    }
  })
}
async function uploadFile (key, localFile) {
  const extname = path.extname(localFile) // 获取文件的扩展名
  const mimeName = mime.getType(extname) // getType()返回的MIME类型
  const putExtra = new qiniu.form_up.PutExtra({ mimeType: mimeName })
  return new Promise((resolve, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (
      respErr,
      respBody,
      respInfo
    ) {
      if (respErr) {
        reject(respErr)
      }
      resolve({ respBody, respInfo })
    })
  })
}

function getFileKey (pre, file) {
  if (file.indexOf(pre) > -1) {
    const key = file.split(pre)[1]
    return key.startsWith('/') ? key.substring(1) : key
  }
  return file
}

(async () => {
  console.time('上传文件到cdn')
  await uploadFileCDN(files)
  console.timeEnd('上传文件到cdn')
})()
