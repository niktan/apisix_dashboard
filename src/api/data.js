import axios from '@/libs/api.request';
export const getRoutersList = () => {
  return axios.request({
    url: '/apisix/admin/routes',
    method: 'get'
  });
};

export const updateRouter = (key,data) => {
  return axios.request({
    url: '/apisix/admin/routes/'+key,
    method: 'put',
    data:data
  });
};

export const deleteRouter = (key) => {
  return axios.request({
    url: '/apisix/admin/routes/' + key,
    method: 'delete'
  });
};

export const getRoutersData = (key) => {
  return axios.request({
    url: '/apisix/admin/routes/' + key,
    method: 'get'
  });
};

export const getUpstreamsList = () => {
  return axios.request({
    url: '/apisix/admin/upstreams',
    method: 'get'
  });
};

export const getUpstreamsData = (key) => {
  return axios.request({
    url: '/apisix/admin/upstreams/' + key,
    method: 'get'
  });
};

export const deleteUpstream = (key) => {
  return axios.request({
    url: '/apisix/admin/upstreams/' + key,
    method: 'delete'
  });
};

export const addUpstream = (data) => {
  return axios.request({
    url: '/apisix/admin/upstreams',
    method: 'post',
    data: data
  });
};

export const updateUpstream = (key,data) => {
  return axios.request({
    url: '/apisix/admin/upstreams/' + key,
    method: 'put',
    data: data
  });
};

export const getServicesList = () => {
  return axios.request({
    url: '/apisix/admin/services',
    method: 'get'
  });
};
export const getServicesData = (key) => {
  return axios.request({
    url: '/apisix/admin/services/' + key,
    method: 'get'
  });
};
export const updateService = (key,data) => {
  return axios.request({
    url: '/apisix/admin/services/' + key,
    method: 'put',
    data:data
  });
}

export const deleteService = (key) => {
  return axios.request({
    url: '/apisix/admin/services/' + key,
    method: 'delete'
  });
};
export const addService = (data) => {
  return axios.request({
    url: '/apisix/admin/services',
    method: 'post',
    data: data
  });
};

//consumers

export const getConsumersList = () => {
  return axios.request({
    url: '/apisix/admin/consumers',
    method: 'get'
  });
};
export const getConsumerData = (key) => {
  return axios.request({
    url: '/apisix/admin/consumers/' + key,
    method: 'get'
  });
};
export const updateConsumer = (data) => {
  return axios.request({
    url: '/apisix/admin/consumers',
    method: 'put',
    data:data
  });
}

export const deleteConsumer = (key) => {
  return axios.request({
    url: '/apisix/admin/consumers/' + key,
    method: 'delete'
  });
};

export const addConsumer = (data) => {
  return axios.request({
    url: '/apisix/admin/consumers',
    method: 'put',
    data: data
  });
};

//ssl

export const getSslsList = () => {
  return axios.request({
    url: '/apisix/admin/ssl',
    method: 'get'
  });
};
export const getSslData = (key) => {
  return axios.request({
    url: '/apisix/admin/ssl/' + key,
    method: 'get'
  });
};
export const updateSsl = (key,data) => {
  return axios.request({
    url: '/apisix/admin/ssl/'+key,
    method: 'put',
    data:data
  });
}

export const deleteSsl = (key) => {
  return axios.request({
    url: '/apisix/admin/ssl/' + key,
    method: 'delete'
  });
};

export const addSsl = (data) => {
  return axios.request({
    url: '/apisix/admin/ssl',
    method: 'post',
    data: data
  });
};


export const getPluginsList = () => {
  return axios.request({
    url: '/apisix/admin/plugins/list',
    method: 'get'
  });
};

export const getPluginConfig = (plugin) => {
  return axios.request({
    url: '/apisix/admin/schema/plugins/' + plugin,
    method: 'get'
  });
};

export const addRouters = (data) => {
  return axios.request({
    url: '/apisix/admin/routes',
    method: 'post',
    data: data
  });
};

export const getTableData = () => {
  return axios.request({
    url: 'get_table_data',
    method: 'get'
  });
};

export const getDragList = () => {
  return axios.request({
    url: 'get_drag_list',
    method: 'get'
  });
};

export const errorReq = () => {
  return axios.request({
    url: 'error_url',
    method: 'post'
  });
};

export const saveErrorLogger = (info) => {
  return axios.request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  });
};

export const uploadImg = (formData) => {
  return axios.request({
    url: 'image/upload',
    data: formData
  });
};

export const getOrgData = () => {
  return axios.request({
    url: 'get_org_data',
    method: 'get'
  });
};

export const getTreeSelectData = () => {
  return axios.request({
    url: 'get_tree_select_data',
    method: 'get'
  });
};
