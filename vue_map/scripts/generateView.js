const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const resolve = (...file) => path.resolve(__dirname, ...file)
const log = (message) => console.log(chalk.green(message))
const errorLog = (message) => console.log(chalk.red(message))
const successLog = (message) => console.log(chalk.blue(message))
const { vueTemplate } = require('./generateTemplate.js')

const genenrateFile = (path, data) => {
  if (fs.existsSync(path)) {
    errorLog(`${path}文件已经存在`)
    return
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', err => {
      if (err) {
        errorLog(err.message)
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
log('请输入要生成的页面组件名称，会生成在views文件夹下！')

let componentName = ''
process.stdin.on('data', async chunk => {
  const inputName = String(chunk).trim().toString()
  let componentVueName = resolve('../src/views', inputName)
  // endsWith——测试字符串是否以指定的后缀结束。
  if (!componentVueName.endsWith('.vue')) {
    componentVueName += '.vue'
  }
  // 返回目录名
  const componentDirectory = path.dirname(componentVueName)
  const hascomponentVueName = fs.existsSync(componentVueName)
  if (hascomponentVueName) {
    errorLog(`${inputName}页面组件已存在`)
    return
  } else {
    log(`正在生成component目录${componentDirectory}`)
    await dotExistDirectoryCreate(componentDirectory)
  }
  try {
    if (inputName.includes('/')) {
      const inputArr = inputName.split('/')
      componentName = inputArr[inputArr.length - 1]
    } else {
      componentName = inputName
    }
    log(`正在生成页面组件${componentVueName}`)
    await genenrateFile(componentVueName, vueTemplate(componentName))
    successLog(`文件生成成功`)
  } catch (e) {
    errorLog(e.name)
  }
  process.stdin.emit('end')
})

process.stdin.on('end', () => {
  log(`退出`)
  process.exit()
})

function dotExistDirectoryCreate (directory) {
  return new Promise(resolve => {
    mkdirs(directory, function () {
      resolve(true)
    })
  })
}

function mkdirs (directory, callback) {
  var existFlag = fs.existsSync(directory)
  if (existFlag) {
    callback()
  } else {
    mkdirs(path.dirname(directory), function () {
      fs.mkdirSync(directory)
      callback()
    })
  }
}
