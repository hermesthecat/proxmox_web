/** * * * * * * * * * * * * * * * * * * * * * * **
 *                    _ooOoo_                    *
 *                   o8888888o                   *
 *                   88" . "88                   *
 *                   (| -_- |)                   *
 *                   O\  =  /O                   *
 *                ____/`---'\____                *
 *              .'  \\|     |//  `.              *
 *             /  \\|||  :  |||//  \             *
 *            /  _||||| -:- |||||-  \            *
 *            |   | \\\  -  /// |   |            *
 *            | \_|  ''\---/''  |   |            *
 *            \  .-\__  `-`  ___/-. /            *
 *          ___`. .'  /--.--\  `. . __           *
 *       ."" '<  `.___\_<|>_/___.'  >'"".        *
 *      | | :  `- \`.;`\ _ /`;.`/ - ` : | |      *
 *      \  \ `-.   \_ __\ /__ _/   .-` /  /      *
 * ======`-.____`-.___\_____/___.-`____.-'====== *
 *                    `=---='                    *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ *
 *         Buddha bless us with no bugs          *
 *    This code has been blessed, no bugs!       *
 * * * * * * * * * * * * * * * * * * * * * * * **/

import axios from 'axios';
import { stringify } from 'qs';
import { Loading } from 'element-ui'

export default class Http {
  /**
   * Constructor takes custom configurations,
   * Axios related global configurations use sxAjax instance:
   * sxAjax.defaults.xxx sxAjax.mockDefaults.xxx for configuration
   *
   * @param onShowErrorTip How to display error tips
   * @param onShowSuccessTip How to display success tips
   * @param isMock Distinguish which requests need mock, e.g.: requests starting with '/mock', using mock etc.
   */
  constructor({
    onShowSuccessTip = (/* response, successTip  */) => true,
    onShowErrorTip = (/* err, errorTip */) => true,
    isMock = (/* url, data, method, options */) => false,
  } = {}) {
    this.instance = axios.create();
    this.mockInstance = axios.create();
    this.setDefaultOption(this.instance);
    this.setDefaultOption(this.mockInstance);
    this.defaults = this.instance.defaults;
    this.mockDefaults = this.mockInstance.defaults;

    this.onShowSuccessTip = onShowSuccessTip;
    this.onShowErrorTip = onShowErrorTip;
    this.isMock = isMock;
  }

  setDefaultOption(instance) {
    // instance.defaults.timeout = 10000;
    // instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    // instance.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    instance.defaults.headers.post['Content-Type'] = 'application/json';
    instance.defaults.headers.put['Content-Type'] = 'application/json';
    instance.defaults.baseURL = '/';
    instance.defaults.withCredentials = true; // Enable cross-origin cookies
  }

  /**
   *
   * @param url
   * @param d
   * @param method
   * @param options Configuration data, most commonly used is the [successTip] property, can also override url data method
   * @returns {Promise}
   */
  ajax(url, d = {}, method = 'get', options = {}) {
    //  let loadingInstance = null;
    //  if(url.indexOf('resources') < 0 && url.indexOf('ticket') <0 && url.indexOf('domains')<0) {
    //    loadingInstance = Loading.service({ fullscreen: true});
    //  }
    // Handle null case
    let data = d || {};
    options = options || {};

    let {
      successTip = false, // Default false, don't show
      errorTip, //  = method === 'get' ? 'Failed to get data!' : 'Operation failed!', // Default error message
      noEmpty = false, // Filter out parameters with values null, '', undefined, don't send to backend
      originResponse = false,
    } = options;

    // Delete data where values are null, '', undefined, don't send to backend
    if (noEmpty === true && typeof data === 'object' && !Array.isArray(data)) {
      const noEmptyData = {};

      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== '' && value !== void 0) {
          noEmptyData[key] = value;
        }
      });

      data = noEmptyData;
    }

    const CancelToken = axios.CancelToken;
    let cancel;

    const isGet = method === 'get';
    const isDelete = method === 'delete';
    const isMock = this.isMock(url, data, method, options);

    let instance = this.instance;

    /*
     * No processing in wrapper, if needed, handle through following method or other methods
     * axiosInstance.interceptors.request.use(cfg => {
     *   // Do something before request is sent
     *   return cfg;
     * }, error => {
     *   // Do something with request error
     *   return Promise.reject(error);
     * });
     *
     * */

    if (isMock) {
      instance = this.mockInstance;
    }
    /*
    *
    * Content-Type application/x-www-form-urlencoded has issues
    * See: https://github.com/axios/axios/issues/362
    *
    * */
    const defaultsContentType = instance.defaults.headers[method]['Content-Type']
      || instance.defaults.headers[method]['content-type']
      || instance.defaults.headers[method]['contentType']
      || '';

    const contentType = (options.headers && options.headers['Content-Type'])
      || (options.headers && options.headers['content-type'])
      || (options.headers && options.headers['contentType'])
      || '';

    const isFormType = (defaultsContentType && defaultsContentType.indexOf('application/x-www-form-urlencoded') > -1)
      || contentType.indexOf('application/x-www-form-urlencoded') > -1;

    if (isFormType) {
      data = stringify(data);
      console.log(data);
    }

    let params = {};
    if (isGet || isDelete) {
      params = data; // params are appended to url for get or delete requests
      data = null; // data is sent in put, post requests
    }

    const ajaxPromise = new Promise((resolve, reject) => {
      instance({
        method,
        url,
        data,
        params,
        cancelToken: new CancelToken(c => cancel = c),
        ...options,
      }).then(response => {
        this.onShowSuccessTip(response, successTip);
        resolve(originResponse ? response : response.data);
        //loadingInstance && loadingInstance.close();
      }, err => {
        const isCanceled = err && err.message && err.message.canceled;
        if (isCanceled) return; // If user actively cancels, do nothing and don't trigger any functions
        this.onShowErrorTip(err, errorTip);
        if (err.response && err.response.data && err.response.data && err.response.data.errors) reject(err.response.data.errors);
        else reject(err.response && err.response.statusText && err.response.statusText);
        //loadingInstance && loadingInstance.close();
      }).catch(error => {
        reject(error);
        //loadingInstance && loadingInstance.close();
      });
    });
    ajaxPromise.cancel = function () {
      cancel({
        canceled: true,
      });
    };
    return ajaxPromise;
  }

  /**
   * Send a GET request, generally used for query operations
   * @param {string} url Request path
   * @param {object} [params] Data sent to backend, normally converted to query string and appended to url
   * @param {object} [options] Axios configuration parameters
   * @returns {Promise}
   */
  get(url, params, options) {
    return this.ajax(url, params, 'get', options);
  }

  /**
   * Send a POST request, generally used for add operations
   * @param {string} url Request path
   * @param {object} [data] Data sent to backend
   * @param {object} [options] Axios configuration parameters
   * @returns {Promise}
   */
  post(url, data, options) {
    return this.ajax(url, data, 'post', options);
  }

  /**
   * Send a PUT request, generally used for update operations
   * @param {string} url Request path
   * @param {object} [data] Data sent to backend
   * @param {object} [options] Axios configuration parameters
   * @returns {Promise}
   */
  put(url, data, options) {
    return this.ajax(url, data, 'put', options);
  }

  /**
   * Send a PATCH request, generally used for partial data updates
   * @param {string} url Request path
   * @param {object} [data] Data sent to backend
   * @param {object} [options] Axios configuration parameters
   * @returns {Promise}
   */
  patch(url, data, options) {
    return this.ajax(url, data, 'patch', options);
  }

  /**
   * Send a DELETE request, generally used for deleting data, params will be ignored (defined in HTTP protocol)
   * @param {string} url Request path
   * @param {object} [data] Data sent to backend
   * @param {object} [options] Axios configuration parameters
   * @returns {Promise}
   */
  del(url, data, options) {
    return this.ajax(url, data, 'delete', options);
  }
}
