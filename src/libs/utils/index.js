const path = require('path');
import { http } from '@libs/http/index';
import { Container, Message } from 'element-ui';
import { gettext } from '@src/i18n/local_zhCN.js';
import { kvm_vga_drivers } from '@libs/enum/enum.js';
import Axios from 'axios';

var IPV4_OCTET = "(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])";
var IPV4_REGEXP = "(?:(?:" + IPV4_OCTET + "\\.){3}" + IPV4_OCTET + ")";
var IPV6_H16 = "(?:[0-9a-fA-F]{1,4})";
var IPV6_LS32 = "(?:(?:" + IPV6_H16 + ":" + IPV6_H16 + ")|" + IPV4_REGEXP + ")";
var IP4_match = new RegExp("^(?:" + IPV4_REGEXP + ")$");
const IP4_cidr_match = new RegExp("^(?:" + IPV4_REGEXP + ")\/[1-3][0-9]?$");
var IPV6_REGEXP = "(?:" +
  "(?:(?:" + "(?:" + IPV6_H16 + ":){6})" + IPV6_LS32 + ")|" +
  "(?:(?:" + "::" + "(?:" + IPV6_H16 + ":){5})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){4})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,1}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){3})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,2}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){2})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,3}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){1})" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,4}" + IPV6_H16 + ")?::" + ")" + IPV6_LS32 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,5}" + IPV6_H16 + ")?::" + ")" + IPV6_H16 + ")|" +
  "(?:(?:(?:(?:" + IPV6_H16 + ":){0,7}" + IPV6_H16 + ")?::" + ")" + ")" +
  ")";
var IP6_match = new RegExp("^(?:" + IPV6_REGEXP + ")$");
var IP6_cidr_match = new RegExp("^(?:" + IPV6_REGEXP + ")\/[0-9]{1,3}?$");
var IP6_bracket_match = new RegExp("^\\[(" + IPV6_REGEXP + ")\\]");

var IP64_match = new RegExp("^(?:" + IPV6_REGEXP + "|" + IPV4_REGEXP + ")$");

// Get event object compatible with IE
function getEvent(ev) {
  return ev || window.event;
}
// Stop event bubbling
function stopEvent(ev) {
  // If event object is provided, this is a non-IE browser
  if (ev && ev.stopPropagation)
    // Therefore it supports W3C's stopPropagation() method
    ev.stopPropagation();
  else
    // Otherwise, we need to use IE's way to cancel event bubbling
    window.event.cancelBubble = true;
}
/**
 * @param fn callback to trigger
 * @param delay time interval to trigger
 * */
function debounce(fn, delay) {
  let timer;
  return function () {
    let context = this;
    let args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

/**
 * Throttle function
 * @param fn callback to trigger
 * @param delay time interval to trigger
 * */
function throttle(func, delay, immediate) {
  let prev = Date.now();
  return function () {
    const context = this;
    const args = arguments;
    if (immediate) {
      func.apply(context, args);
    } else {
      let now = Date.now();
      if (now - prev >= delay) {
        func.apply(context, args);
        prev = Date.now();
      }
    }
  }
}

/**
 * Parse cookie
 * */
function parseCookie() {
  let cookies = document.cookie.split(";");
  return cookies.reduce((target, cookie) => {
    let key = cookie.split("=")[0];
    let value = cookie.split("=")[1];
    target[key] = value;
    return target;
  }, {})
}

/**
 * Set cookie
 * */
function setCookie(name, value) {
  var argv = arguments,
    argc = arguments.length,
    expires = (argc > 2) ? argv[2] : null,
    path = (argc > 3) ? argv[3] : '/',
    domain = (argc > 4) ? argv[4] : null,
    secure = (argc > 5) ? argv[5] : false;

  let str = name + "=" + escape(value) + ((expires === null) ? "" : ("; expires=" + expires.toUTCString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
  console.log(str);
  document.cookie = str;
}
/**
 * @param name Get cookie value
 * */
function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}
/**
 * Delete cookie
 * */
function delCookie(name, path) {
  if (this.get(name)) {
    path = path || '/';
    document.cookie = name + '=' + '; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=' + path;
  }
}
/**
 * Tree structure data processing
 * */
function treeNode(data, cb) {
  let loop = item => {
    if (item.childNodes && item.childNodes.length > 0) {
      treeNode(item.childNodes, cb)
    } else {
      cb(item)
    }
  }
  return loop(data);
}
/**
 * Format date
 * */
function dateFormat(date, format) {
  if (!date) return;
  let d = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let o in d) {
    if (new RegExp(`(${o})`).test(format)) {
      let str = d[o] + ''
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return format;
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

/**
 * Array deduplication
 * */
function arrayToHeavy(arr) {
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (!newArr.includes(arr[i])) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

/**
 * Bubble sort
 * */
function bubbleSort(arr) {
  // Control loop
  for (let i = 0; i < arr.length; i++) {
    // Traverse array
    for (let j = 0; j < arr.length - i - 1; j++) {
      let temp;
      if (arr[j] > arr[j + 1]) {
        temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
/**
 * Quick sort @param array original array;
 * prop sort by which field
 * order default descending order - means descending, + means ascending
 * */
function quickSort(array, prop, order = '-') {
  if (!Array.isArray(array)) return;
  let sort = (arr, left = 0, right = arr.length - 1) => {
    if (left >= right) return;
    let i = left, j = right, baseVal = arr[j] // Use last element as base
    while (i < j) {
      if (Object.prototype.toString.call(arr[i]) === '[object Object]' || Object.prototype.toString.call(arr[j]) === '[object Object]') {
        if (order == '-') {
          while (i < j && arr[i][prop] >= baseVal[prop]) {
            i++;
          }
          arr[j] = arr[i];
          while (i < j && arr[j][prop] <= baseVal[prop]) {
            j--;
          }
          arr[i] = arr[j];
        } else {
          while (i < j && arr[i][prop] <= baseVal[prop]) {
            i++;
          }
          arr[j] = arr[i];
          while (i < j && arr[j][prop] >= baseVal[prop]) {
            j--;
          }
          arr[i] = arr[j];
        }
      } else {
        while (i < j && arr[i] <= baseVal) {
          i++;
        }
        arr[j] = arr[i];
        while (i < j && arr[j] >= baseVal) {
          j--;
        }
        arr[i] = arr[j];
      }
    }
    arr[j] = baseVal; // When i=j put base value in center position to complete one cycle
    sort(arr, left, j - 1); // Sort left side of baseVal
    sort(arr, j + 1, right); // Sort right side of baseVal
  }
  const newArr = array.concat(); // Deep copy array, new array changes don't affect original array
  sort(newArr);
  return newArr;
}
/**
 * Deep copy object
 * */
function deepCopy(source) {
  if (!isObject(source)) return source;
  let target = Array.isArray(source) ? [] : {};
  for (let k in source) {
    if (source.hasOwnProperty(k)) {
      if (typeof source[k] === 'object') {
        target[k] = deepCopy(source[k])
      } else {
        target[k] = source[k];
      }
    }
  }
  return target;
}
/**
 * Check if it's an object
 * */
function isObject(obj) {
  return typeof obj === 'object' || obj !== null
}
/**
 * Capitalize first letter of each English word
 * */
function capitalizeToAll(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}
/**
 * Capitalize first letter
 * */
function capitalizeToFirst(str) {
  return str.toLowerCase().replace(/\b([\w|']+)\b/, (o) => o.replace(o.charAt(0), o.charAt(0).toUpperCase()))
}
/**
 * Format size
 * */
function byteToSize(bytes, unit, width) {
  bytes = Number(bytes);
  if (typeof bytes !== 'number' && isNaN(bytes)) bytes = 0;
  if (bytes < 0) bytes = 0;
  if (typeof width === 'undefined') width = 2;
  if (typeof unit === 'undefined') unit = 'iB';
  let num = Math.pow(10, width); // Exponential function 10 to the power of n
  var sizes = ['K', 'M', 'G', 'T', 'P']; // Units
  if (unit) { // Unit exists
    sizes.unshift('');
  } else {
    sizes.unshift('Byte')
  }
  if (bytes === 0) return '0 ' + sizes[0] + unit;
  var i = Math.floor(Math.log(bytes) / Math.log(1024)); // Calculate natural logarithm of 1024
  // for 0.xxxx number
  if (i < 0) i = 0;
  if (sizes[i] === 'B') num = 1;
  if (i >= 5) i = 5;
  return Math.round(bytes / Math.pow(1024, i) * num) / num + ' ' + sizes[i] + unit;
}
/**
 * Get event target compatible with IE
 * */
function getEventTarget(event) {
  return event.target || event.srcElement;
}


function format_duration_long(ut) {
  var days = Math.floor(ut / 86400);
  ut -= days * 86400;
  var hours = Math.floor(ut / 3600);
  ut -= hours * 3600;
  var mins = Math.floor(ut / 60);
  ut -= mins * 60;

  var hours_str = '00' + hours.toString();
  hours_str = hours_str.substr(hours_str.length - 2);
  var mins_str = "00" + mins.toString();
  mins_str = mins_str.substr(mins_str.length - 2);
  var ut_str = "00" + ut.toString();
  ut_str = ut_str.substr(ut_str.length - 2);

  if (days) {
    var ds = days > 1 ? '天' : '天';
    return days.toString() + ' ' + ds + ' ' +
      hours_str + ':' + mins_str + ':' + ut_str;
  } else {
    return hours_str + ':' + mins_str + ':' + ut_str;
  }
}

function render_uptime(value, metaData, record, rowIndex, colIndex, store) {

  var uptime = value;

  if (uptime === undefined) {
    return '';
  }

  if (uptime <= 0) {
    return '-';
  }

  return format_duration_long(uptime);
}
/**
 * Load all images
 * */
function requireAll2Obj(requireContext) {
  let obj = {}
  requireContext.keys().forEach(key => {
    let k = path.basename(key).slice(0, -4)
    obj[k] = requireContext(key)
  })
  return obj
}
/**
 * Open console
 * */
function openConsoleWindow(viewer, vmtype, vmid, nodename, vmname, cmd) {
  // kvm, lxc, shell, upgrade

  if (vmid == undefined && (vmtype === 'kvm' || vmtype === 'lxc')) {
    throw "missing vmid";
  }

  if (!nodename) {
    throw "no nodename specified";
  }

  if (viewer === 'applet' || viewer === 'html5') {
    openVNCViewer(vmtype, vmid, nodename, vmname, viewer === 'html5');
  } else if (viewer === 'xtermjs') {
    openXtermJsViewer(vmtype, vmid, nodename, vmname, cmd);
  } else if (viewer === 'vv') {
    var url;
    var params = { proxy: windowHostname() };
    if (vmtype === 'kvm') {
      url = '/json/nodes/' + nodename + '/qemu/' + vmid.toString() + '/spiceproxy';
      openSpiceViewer(url, params);
    } else if (vmtype === 'lxc') {
      url = '/' + nodename + '/lxc/' + vmid.toString() + '/spiceproxy';
      openSpiceViewer(url, params);
    } else if (vmtype === 'shell') {
      url = '/json/nodes/' + nodename + '/spiceshell';
      openSpiceViewer(url, params);
    } else if (vmtype === 'upgrade') {
      url = '/json/nodes/' + nodename + '/spiceshell';
      params.upgrade = 1;
      openSpiceViewer(url, params);
    }
  } else {
    throw "unknown viewer type";
  }
}

function openXtermJsViewer(vmtype, vmid, nodename, vmname, cmd) {
  var url = parseQueryString({
    console: vmtype, // kvm, lxc, upgrade or shell
    xtermjs: 1,
    vmid: vmid,
    vmname: vmname,
    node: nodename,
    cmd: cmd,

  });
  var nw = window.open("/shell/?" + url, '_blank', 'toolbar=no,location=no,status=no,menubar=no,resizable=yes,width=800,height=420');
  if (nw) {
    nw.focus();
  }
}

function parseQueryString(param) {
  if (typeof param !== 'object') return;
  let url = '';
  for (let i in param) {
    url += `${i}=${param[i] === 0 ? String(param[i]) : param[i] ? param[i] : ''}&`
  }
  return url.slice(0, url.length - 1);
}

function openVNCViewer(vmtype, vmid, nodename, vmname, novnc) {
  var options = {
    console: vmtype ? vmtype : '', // kvm, lxc, upgrade or shell
    novnc: novnc ? 1 : 0,
    vmid: String(vmid) ? vmid : '',
    vmname: vmname ? vmname : '',
    node: nodename ? nodename : '',
    resize: 'off',
    cmd: ''
  }, url = '';
  for (let it in options) {
    url += encodeURIComponent(it) + '=' + encodeURIComponent(options[it]) + '&';
  }
  var dlink = document.createElement('a');
  dlink.setAttribute('type', 'hidden');
  dlink.setAttribute('target', '_blank');
  dlink.href = "/shell/?" + url.slice(0, url.length - 1);
  document.body.appendChild(dlink);
  dlink.click();
  dlink.remove()
  // a.setAttribute('href', "/shell/?" + url.slice(0, url.length - 1));  
  // a.setAttribute('target', '_blank');  
  // a.click();  
  //var nw = window.open("/shell/?" + url.slice(0, url.length - 1), '_blank', "innerWidth=745,innerheight=427");
  //nw && nw.focus();
}

function windowHostname() {
  return window.location.hostname.replace(IP6_bracket_match,
    function (m, addr, offset, original) { return addr; });
}

function openSpiceViewer(url, params) {

  var downloadWithName = function (uri, name) {
    var link = appendDom(document.body, {
      tag: 'a',
      href: uri,
      css: 'display:none;visibility:hidden;height:0px;'
    });
    // Note: we need to tell android the correct file name extension
    // but we do not set 'download' tag for other environments, because
    // It can have strange side effects (additional user prompt on firefox)
    var andriod = navigator.userAgent.match(/Android/i) ? true : false;
    if (andriod) {
      link.download = name;
    }

    if (link.fireEvent) {
      link.fireEvent('onclick');
    } else {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      link.dispatchEvent(evt);
    }
  };

  http.ajax(url, params, 'post', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
  }).then((response) => {
    var raw = "[virt-viewer]\n";
    for (let it in response.data) {
      raw += it + "=" + response.data[it] + "\n";
    }
    var url = 'data:application/x-virt-viewer;charset=UTF-8,' +
      encodeURIComponent(raw);
    downloadWithName(url, "pve-spice.vv");
  }).catch((response) => {
    Message.error(response.htmlStatus ? response.htmlStatus : '');
  });
}

function appendDom(el, options = {}) {
  let tag = document.createElement(options.tag);
  tag.href = options.href;
  tag.style = options.css;
  el.parentNode.insertBefore(tag, el);
  return tag;
}

function getDocument() {
  return document.documentElement || document.body;
}

function genUniqueId() {
  // function s4 () {
  //   return Math.floor((1 + Math.random()) * 0x10000)
  //     .toString(16)
  //     .substring(1)
  // }
  // return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
  // return s4() + s4() + 'dca14c9d8a02fbdb108ba4a5'
  const firstCount = 12;
  const secondCount = 3;
  const thirdCount = 15;
  let chars = '0123456789abcdef'.split('');
  let fn = () => {
    return chars[Math.floor(Math.random() * 16)]
  };
  let uuid = '';
  for (let i = 0; i < firstCount; i++) {
    uuid += fn()
  }
  uuid += '12345'.split('')[Math.floor(Math.random() * 5)];
  for (let i = 0; i < secondCount; i++) {
    uuid += fn()
  }
  uuid += '89ab'.split('')[Math.floor(Math.random() * 4)];
  for (let i = 0; i < thirdCount; i++) {
    uuid += fn()
  }
  return uuid
  // [0-9a-f]{12}[1-5][0-9a-f]{3}[89ab][0-9a-f]{15}
}

function browserLocalStorageGetItem(item) {
  return window.localStorage.getItem(item);
}

function browserLocalStorageSetItem(item, value) {
  return window.localStorage.setItem(item, value)
}

function browserLocalStorageRemoveItem(item) {
  return window.localStorage.removeItem(item)
}

function getEventDataFromWindow(item) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  if (!window.__eventStorage__[item]) return null;
  return window.__eventStorage__[item]
}

function setEventDataToWindow(item, value) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  window.__eventStorage__[item] = value
}

function removeEventDataInWindow(item) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  window.__eventStorage__[item] = null
}

function isLongJobEvent(eventId) {
  let longJobListName = `longJobList-${getIdentityUuid()}`;
  let longJobList = JSON.parse(browserLocalStorageGetItem(longJobListName));
  if (!longJobList) longJobList = [];
  for (let longJob of longJobList) {
    if (eventId === longJob.id) return true
  }
  return false
}

function getIdentityUuid() {
  let identityUuid;
  if (localStorage.getItem('loginType') === 'account') {
    identityUuid = localStorage.getItem('accountUuid')
  } else if (localStorage.getItem('loginType') === 'user') {
    identityUuid = localStorage.getItem('userUuid')
  } else {
    identityUuid = localStorage.getItem('uid')
  }
  return identityUuid
}
// Check if it's a leaf node
function isLeaf() {
  return this.get('leaf') === true;
}

function setIconCls(info, typeDefaults) {
  if (!info) return;
  let cls = get_object_icon_class(info.type, info, typeDefaults);
  if (cls !== '') {
    info.iconCls = cls;
  }
  return info;
}

function get_object_icon_class(type, record, typeDefaults) {
  let status = '';
  let objType = type;
  if (type === 'type') {
    // for folder view
    objType = record.groupbyid;
  } else if (record.template) {
    // templates
    objType = 'template';
    status = type;
  } else {
    // everything else
    status = record.status ? record.status + ' ha-' + record.hastate : ' ha-' + record.hastate;
  }
  if (record.lock) {
    status += ' locked lock-' + record.lock;
  }
  var defaults = typeDefaults[objType];
  if (defaults && defaults.iconCls) {
    var retVal = defaults.iconCls + ' ' + status;
    return retVal;
  }
  return '';
}

/**
 * Precise addition
 */
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
};
/**
 * Precise subtraction
 * */
function subtract(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum - num2 * baseNum) / baseNum;
}

/**
 * Precise multiplication
 * @param {arg1} represents floating point number
 * @param {arg2} represents floating point number
 * Decimal places equal to sum of decimal places of each multiplier
 * */
function multiply(arg1, arg2) {
  // m represents number of decimal points
  var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length
  }
  catch (e) {

  }
  try {
    m += s2.split(".")[1].length
  }
  catch (e) {

  }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

/**
 * Precise division
 * */
function divide(arg1, arg2) {
  var t1 = 0, t2 = 0, r1, r2;
  try {
    t1 = arg1.toString().split(".")[1].length
  }
  catch (e) {

  }
  try {
    t2 = arg2.toString().split(".")[1].length
  }
  catch (e) {

  }
  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return (r1 / r2) * Math.pow(10, t2 - t1);
};

// Upload large files in chunks
function uploadChunks(index = 0, chunkSize = 1024 * 1024, totalSize, finishCb) {
  let start = index * chunkSize,
    total = totalSize;
  if (start >= total) {
    finishCb();
  }
  while (start < total) {
    let formData = new FormData(),
      { filename, ext } = file.name.split('.'),
      blob = file.slice(start, start + chunkSize),
      blobname = `${filename}.${index}.${ext}`;
    blobfile = new File([blob], blobname);
    formData.append(file, blobfile);
    axios.post('/upload', formData).then(res => {
      uploadChunks(index + 1);
    })
  }
}

// Default is 'SeaBIOS'
function render_qemu_bios(value) {
  if (!value) {
    return 'Default' + ' (SeaBIOS)';
  } else if (value === 'seabios') {
    return "SeaBIOS";
  } else if (value === 'ovmf') {
    return "OVMF (UEFI)";
  } else {
    return value;
  }
}

// Keep n decimal places
function flotToFixed(num, position) {
  return Math.round(num * Math.pow(10, position)) / Math.pow(10, position);
}

// Calculate percentage
function percentToFixed(num, digit) {
  let m = Math.pow(10, digit),
    a = Math.round(num * m, 10) / m,
    c = 0, d = a.toString(), b = 100,
    e = b.toString();
  try {
    c += d.split(".")[1].length;
  } catch (f) {

  }
  try {
    c += e.split(".")[1].length;
  } catch (f) {

  }
  return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c) + '%';
}

// Copy information
function copyText(content) {
  let targetElm
  if (content.indexOf('\n') !== -1) {
    targetElm = document.createElement('textarea')
  } else {
    targetElm = document.createElement('span')
  }
  var newContent = document.createTextNode(content)
  targetElm.appendChild(newContent)
  document.body.appendChild(targetElm)
  Promise.resolve().then(() => {
    var range = document.createRange()
    range.selectNode(targetElm)
    window.getSelection().removeAllRanges()
    Promise.resolve().then(() => {
      range.selectNode(targetElm)
      window.getSelection().addRange(range)
      document.execCommand('copy')
      window.getSelection().removeAllRanges()
      document.body.removeChild(targetElm)
    })
  })
}

// Fingerprint parsing
function printPropertyString(data, defaultKey) {
  let stringparts = [],
    gotDefaultKeyVal = false,
    defaultKeyVal;
  for (let key in data) {
    if (defaultKey !== undefined && key === defaultKey) {
      gotDefaultKeyVal = true;
      defaultKeyVal = value;
    } else {
      stringparts.push(key + '=' + data[key]);
    }
  }

  stringparts = stringparts.sort();
  if (gotDefaultKeyVal) {
    stringparts.unshift(defaultKeyVal);
  }
  return stringparts.join(',');
}

// HTTP proxy
function httpProxy(v) {
  return (/^http:\/\/.*$/).test(v);
}

// Parse task ID
function parse_task_upid(upid) {
  var task = {};

  var res = upid.match(/^UPID:([^\s:]+):([0-9A-Fa-f]{8}):([0-9A-Fa-f]{8,9}):(([0-9A-Fa-f]{8,16}):)?([0-9A-Fa-f]{8}):([^:\s]+):([^:\s]*):([^:\s]+):$/);
  if (!res) {
    throw "unable to parse upid '" + upid + "'";
  }
  task.node = res[1];
  task.pid = parseInt(res[2], 16);
  task.pstart = parseInt(res[3], 16);
  if (res[5] !== undefined) {
    task.task_id = parseInt(res[5], 16);
  }
  task.starttime = parseInt(res[6], 16);
  task.type = res[7];
  task.id = res[8];
  task.user = res[9];

  return task;
}

// Check if value is empty
const isEmpty = function (val) {
  // null or undefined
  if (val == null) return true;
  if (val == undefined) return true;

  if (typeof val === 'boolean') return false;

  if (typeof val === 'number') return !val;

  if (val instanceof Error) return val.message === '';

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length;

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size;
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length;
    }
  }

  return false;
}

// Parse ACME certificate
function parseACME(value) {
  if (!value) {
    return {};
  }

  var res = {};
  var error;

  value.split(',').forEach(p => {
    var kv = p.split('=', 2);
    if (!isEmpty(kv[1])) {
      res[kv[0]] = kv[1];
    } else {
      error = 'Failed to parse key-value pair: ' + p;
      return false;
    }
  });

  if (error !== undefined) {
    console.error(error);
    return;
  }

  if (res.domains !== undefined) {
    res.domains = res.domains.split(/;/);
  }

  return res;
}

// Upload file and display content
function uplodFile(file, callback) {
  if (file.size > 8192) {
    Vue.$confim.error({
      msg: gettext("Invalid file size: ") + file.size
    });
    return;
  }
  let reader = new FileReader();
  reader.onload = function (evt) {
    callback(evt.target.result);
  };
  reader.readAsText(file);
}

// Image upload
function uploadImage(file, callback) {
  let reader = new FileReader();
  reader.onerror = function (evt) {
    throw new Error(evt);
  }
  reader.onload = function (evt) {
    callback(evt)
  }
  reader.readAsDataURL(file);
}

// Get xhr object
function getHttpXhr() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return new ActiveXObject();
  }
}

// File upload/download, progress, error
function uploadFile(url, data, callback) {
  // Get xhr object
  let xhr = getHttpXhr();
  return new Promise((resolve, reject) => {
    // Monitor readState object
    xhr.onreadystatechange = function (res) {
      if (xhr.readyState == 4 && xhr.status === 200) {
        resolve(xhr.responseText);
      } else if (/^[4|5](\d+){2}$/.test(xhr.status)) {
        reject(xhr.statusText);
      }
    }
    xhr.addEventListener("load", (ev) => callback(ev, xhr), false);
    xhr.addEventListener("error", (ev) => callback(ev, xhr), false)
    xhr.upload.addEventListener('progress', (ev) => callback(ev, xhr), false)
    xhr.withCredentials = true; // Set cross-domain
    xhr.open("POST", url, true);
    xhr.send(data);
  })
}

// Get file URL
function getFileUrl(file) {
  if (window.webkitURL) {
    return window.webkitURL.createObjectURL(file);
  } else if (window.URL) {
    return window.URL.createObjectURL(file);
  } else if (window.createObjectURL) {
    return window.createObjectURL(file);
  }
}

// Format task log description
function format_task_description(type, id) {
  var farray = task_desc_table[type];
  var text;
  if (!farray) {
    text = type;
    if (id) {
      type += ' ' + id;
    }
    return text;
  }
  var prefix = farray[0];
  text = farray[1];
  if (prefix) {
    return prefix + ' ' + id + ' - ' + text;
  }
  return text;
}

// Check if it's a Number type
function isNumber(value) {
  return typeof value === 'number'
}

// Array object deduplication
function getUniqueObj(arrays) {
  let newArr = [],
    str = '',
    strArr = [];
  for (let i = 0; i < arrays.length; i++) {
    str = JSON.stringify(arrays[i]);
    if (strArr.indexOf(str) < 0) {
      newArr.push(arrays[i]);
      strArr.push(str);
    }
  }
  return newArr;
}

// Check if it has this class
function hasClass(cls) {
  let classes = this.className.split(' ');
  return classes.includes(cls);
}

// Get IE browser version
function ieVersion() {
  let userAgent = window.navigator.userAgent,
    isMSIE = userAgent.indexOf('MSIE') > -1;
  if (isMSIE) {
    /[MSIE]\s(\d+)/.test(userAgent);
    return RegExp.$1;
  } else {
    /[rv:](\d+)/.test(userAgent);
    return RegExp.$1;
  }
}

// Upload large files in chunks
function uploadChunks(index = 0, chunkSize = 1024 * 1024, totalSize, finishCb) {
  let start = index * chunkSize,
    total = totalSize;
  if (start >= total) {
    finishCb();
  }
  while (start < total) {
    let formData = new FormData(),
      { filename, ext } = file.name.split('.'),
      blob = file.slice(start, start + chunkSize),
      blobname = `${filename}.${index}.${ext}`;
    blobfile = new File([blob], blobname);
    formData.append(file, blobfile);
    axios.post('/upload', formData).then(res => {
      uploadChunks(index + 1);
    })
  }
}

export {
  getEvent,
  stopEvent,
  debounce,
  throttle,
  setCookie,
  parseCookie,
  getCookie,
  delCookie,
  treeNode,
  dateFormat,
  arrayToHeavy,
  bubbleSort,
  quickSort,
  deepCopy,
  capitalizeToAll,
  capitalizeToFirst,
  byteToSize,
  getEventTarget,
  render_uptime,
  requireAll2Obj,
  openConsoleWindow,
  getDocument,
  genUniqueId,
  browserLocalStorageGetItem,
  setEventDataToWindow,
  browserLocalStorageRemoveItem,
  browserLocalStorageSetItem,
  getEventDataFromWindow,
  isLongJobEvent,
  getIdentityUuid,
  isLeaf,
  setIconCls,
  flotToFixed,
  copyText,
  printPropertyString,
  httpProxy,
  macPrefix,
  proxmoxMail,
  percentToFixed,
  parse_task_upid,
  IP4_cidr_match,
  IP4_match,
  IP6_match,
  IP6_cidr_match,
  IP64_match,
  isEmpty,
  parseACME,
  uplodFile,
  render_upid,
  format_content_types,
  render_storage_content,
  uploadFile,
  getFileUrl,
  format_task_description,
  render_serverity,
  stringFormat,
  render_qemu_bios,
  render_kvm_vga_driver,
  forEachBus,
  parseStartup,
  render_kvm_ostype,
  render_hotplug_features,
  render_spice_enhancements,
  render_qga_features,
  format_duration_short,
  formatDateForWeek,
  forEachMP,
  parseSSHKey,
  confirm,
  chunkData,
  on,
  off,
  parseQemuDrive,
  parsePropertyString,
  getUniqueObj,
  hasClass,
  isIE,
  ieVersion,
  add,
  subtract,
  multiply,
  divide,
  uploadImage,
  uploadChunks
}
