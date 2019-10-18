import axios from '@/libs/api.request'

const USER_MAP = {
  super_admin: {
    name: 'super_admin',
    user_id: '1',
    access: [ 'super_admin', 'admin' ],
    token: 'super_admin',
    avator: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
  },
  admin: {
    name: 'admin',
    user_id: '2',
    access: [ 'admin' ],
    token: 'admin',
    avator: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  }
}

export const login = ({ userName, password }) => {
  return new Promise((resolve, reject) => {
    resolve({ data: { token: USER_MAP[userName].token } })
  })

  // const data = {
  //   userName,
  //   password
  // }
  // return axios.request({
  //   url: 'login',
  //   data,
  //   method: 'post'
  // })
}

export const getUserInfo = (token) => {
  return new Promise((resolve, reject) => {
    resolve({ data: { token: USER_MAP[token] } })
  })
  // return axios.request({
  //   url: 'get_info',
  //   params: {
  //     token
  //   },
  //   method: 'get'
  // })
}

export const logout = (token) => {
  return new Promise((resolve, reject) => {
    resolve(null)
  })
  // return axios.request({
  //   url: 'logout',
  //   method: 'post'
  // })
}

export const getUnreadCount = () => {
  return axios.request({
    url: 'message/count',
    method: 'get'
  })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = (msg_id) => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = (msg_id) => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = (msg_id) => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = (msg_id) => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}
