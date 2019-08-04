import axios from 'axios'
import router from '../src/router'
import ElementUI from 'element-ui'
import Qs from 'qs'

const service = axios.create({
  timeout: 5000
  // baseURL: process.env.BASE.URL
})
// post请求时，需要加一个请求头
service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

let loading = null
service.interceptors.request.use(config => {
  loading = ElementUI.Loading.service({
    text: '正在加载中'
  })
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

service.interceptors.response.use(response => {
  const statusCode = response.status
  if (loading) loading.close()
  if (statusCode === 200) {
    return Promise.resolve(response.data)
  } else {
    return Promise.reject(response.data)
  }
}, error => {
  if (loading) loading.close()
  if (!error.response) {
    if (error.message.timeout) {
      console.log('超时了')
      ElementUI.Message({
        type: 'error',
        message: '请求超时，请检查网络连接'
      })
    } else {
      console.log('断网了')
      ElementUI.Message({
        type: 'error',
        message: '请求超时，请检查网络连接'
      })
    }
    return
  }
  const errorCode = error.response.status
  switch (errorCode) {
    case 401 :
      router.replace({
        path: '/login',
        query: {
          redirect: router.currentRoute.fullPath
        }
      })
      break
    case 403 :
      ElementUI.Message({
        type: 'error',
        message: '登录信息过期，重新登录'
      })
      localStorage.removeItem('token')
      setTimeout(() => {
        router.replace({
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          }
        })
      }, 1000)
      break
    case 404 :
      ElementUI.Message({
        type: 'error',
        message: '网络请求地址有误'
      })
      break
    default :
      ElementUI.Message({
        type: 'error',
        message: error.response.data.message
      })
  }
  return Promise.reject(error)
})

export const uploadFile = formData => {
  const res = service.request({
    method: 'post',
    url: 'xxx',
    data: Qs.stringify(formData)
  })
  return res
}
/* 关于请求的调用
async uploadFileFn () {
  let file = document.queryselector('file')
  将获得的表单元素作为参数，对formData进行初始化
  const data = new FormData(file)
  可以通过append()方法来追加数据,为此对象增加数据
  await uploadFile(data)
}
*/

export default service
