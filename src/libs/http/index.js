import Http from './http';
import { Message } from 'element-ui';
import axios from 'axios';
import qs from 'qs';

// Declare a Map to store request identifiers and cancel functions
const pending = new Map()
/**
 * Add request
 * @param {Object} config 
 */
const addPending = (config) => {
  const url = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data)
  ].join('&');
  config.cancelToken = new axios.CancelToken(cancel => {
    if (!pending.has(url)) { // If the current request doesn't exist in pending, add it
      pending.set(url, cancel);
    }
  })
}
/**
 * Remove request
 * @param {Object} config 
 */
const removePending = (config) => {
  const url = [
    config.method,
    config.url,
    qs.stringify(config.params),
    qs.stringify(config.data)
  ].join('&')
  if (pending.has(url)) { // If current request exists in pending, cancel it and remove
    const cancel = pending.get(url)
    cancel(url)
    pending.delete(url)
  }
}
/**
 * Clear requests in pending (called during route changes)
 */
const clearPending = () => {
  for (const [url, cancel] of pending) {
    cancel(url)
  }
  pending.clear()
}


function handleError(error, errorTip) {
  if (error.error.response && error.error.response.status === 401) {
    let count = window.vm.$store.state.db.exceptionLogin.response401count || 0;
    window.vm.$store.dispatch('UPDATE_401_COUNT', { response401count: ++count });
    // When user authentication fails, don't redirect to login page immediately for better user experience
    if (window.vm.$store.state.db.exceptionLogin.response401count > 5) {
      window.location.href = '/login';
      window.vm.$store.dispatch('UPDATE_401_COUNT', { silenceAuthFailures: false });
    }
  }
  if (error.error && error.error.response && error.error.response.statusText) {
    return Promise.reject(error.error.response.statusText);
  }
}
function handleSuccess({ successTip }) {
  if (typeof successTip !== "string") return;
  Message.info(successTip);
}
const http = new Http({
  onShowErrorTip: (error, errorTip) => handleError({ error, errorTip }),
  onShowSuccessTip: (response, successTip) => handleSuccess({ successTip }),
});

http.defaults.baseURL = '/api2';
// Intercept before request

http.instance.interceptors.request.use(cfg => {
  // Add token verification header
  // Do something before request is sent
  if (cfg.url !== "/json/access/ticket")
    cfg.headers['CSRFPreventionToken'] = window.localStorage.getItem('CSRFPreventionToken') || '';
  if (cfg.url !== '/json/cluster/resources') {
    removePending(cfg) // Before starting request, check and cancel previous requests
    addPending(cfg) // Add current request to pending
  }
  return cfg;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});


http.instance.interceptors.response.use(response => {
  removePending(response) // After request completes, remove this request
  return response
}, error => {
  if (axios.isCancel(error)) {

  } else {
    // handle error code
  }
  return Promise.reject(error)
})

export {
  http,
  clearPending
}
