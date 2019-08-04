const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const resolve = (...file) => path.resolve(__dirname, ...file)
const log = message => console.log(chalk.green(message))
const errorLog = message => console.log(chalk.red(message))
const successLog = message => console.log(chalk.blue(message))
const {vueTemplate, entryTemplate} = require('./generateTemplate.js')

const generateFile = (path, data) => {
  if (fs.existsSync(path)) {
    errorLog(`${path}文件已经存在`)
    return
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', err=>{
      if(err) {
        errorLog(err.message)
        reject(err)
      }else {
        resolve(true)
      }
    })
  })
}
log('请输入要生成的组件名称、如需生成全局组件，请加 global/ 前缀')
let componentName = ''
  //一个指向 标准输入流(stdin) 的可读流(Readable Stream),以下为node部分
  // 程序监听输入动作
  //故通过stdin指向输入流
  //resolve 的用法传入文件目录，传入文件名
process.stdin.on('data', async chunk => {
  const inputName = String(chunk).trim().toString()
  // 组件目录路径
  const componentDirectory = resolve('../src/components', inputName)
  // vue组件路径
  const componentVueName = resolve(componentDirectory, 'main.Vue')
  // 入口文件路径
  const entryComponentName = resolve(componentDirectory, 'index.js')
  // fs.existsSync用于判断路径是否存在（存在返回true, 不存在返回false）
  const hasComponentDirectory = fs.existsSync(componentDirectory)
  if (hasComponentDirectory) {
    errorLog(`${componentDirectory}路径已经存在`)
    return
  }else {
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
    log(`正在生成 vue 文件 ${componentVueName}`)
    await generateFile(componentVueName, vueTemplate(componentName))
    log(`正在生成 entry 文件 ${entryComponentName}`)
    await generateFile(entryComponentName, entryTemplate)
    successLog('生成成功')
  } catch (e) {
    errorLog(e.message)
  }
  process.stdin.emit('end')
})
process.stdin.on('end', () => {
  log('exit')
  process.exit()
})

function dotExistDirectoryCreate (directory) {
  return new Promise((resolve) => {
    mkdirs(directory, function () {
      resolve(true)
    })
  })
}

function mkdirs (directory, fn) {
  var existFlag = fs.existsSync(directory)
  if (existFlag) {
    fn()
  } else {
    mkdirs(path.dirname(directory), function () {
      // 同步版的创建路径 ——第一个参数：将创建的目录路径； 第二个参数：读写权限
      fs.mkdirSync(directory)
      fn()
    })
  }
}
