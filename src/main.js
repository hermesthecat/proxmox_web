import Vue from 'vue';
import App from './App';
import { http } from '@libs/http/index';
import store from './store/index';
import router from './route/index';
import '@src/style/font-awasome.less';
import '@src/style/common.less';
import i18n from '@src/i18n/index.js';
import Element from '@src/element/index';
import confirm from '@src/components/confirm/';
import VueMixins from '@src/mixins/VuexMixins';
import VueLazyload from 'vue-lazyload';
import directives from '@src/directives/directive';
import Fragment from 'vue-fragment';
import showdown from 'showdown'// Import markdown file
Vue.use(Fragment.Plugin)
// or
import { Plugin } from 'vue-fragment';
Vue.use(Plugin);
//Custom confirm directive
Vue.directive('confirm', directives);
Vue.directive('slldrag', directives);
// Configuration
Vue.use(VueLazyload, {
  preLoad: 1.3,
  attempt: 1,
  error: require('./assets/error.svg'),
  loading: require('./assets/loading.svg') // Note: Use require for path (using relative path here)
})
//Confirm dialog
Vue.prototype.$confirm = new confirm();
//Dynamic import of element components
Vue.use(Element);
//Global import of vueMixin
Vue.mixin(VueMixins)
//Global http request
Vue.prototype.$http = http;

// Use markdown file
Vue.prototype.md2html = (md) => {
  let converter = new showdown.Converter();
  let text = md.toString();
  let html = converter.makeHtml(text);
  return html
};
window.vm = new Vue({
  el: '#root',
  store,
  i18n,
  router,
  render: h => h(App),
  mounted() {
    //If Token exists, it means already logged in, otherwise not logged in
    if (window.localStorage.getItem('CSRFPreventionToken')) {
      this.$store.dispatch('UPDATE_401_COUNT', { silenceAuthFailures: true })
    } else {
      this.$store.dispatch('UPDATE_401_COUNT', { silenceAuthFailures: false })
    };
  }
})
// === The following code is commented out but kept for reference ===
//
// if(isIE) {
//   // Custom Event polyfill for IE
//   var CustomEvent = function(event, params){
//     params = params || { bubbles: false, cancelable: false, detail: undefined };
//
//     var evt = document.createEvent('CustomEvent');
//
//     evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
//
//     return evt;
//   };
//
//   CustomEvent.prototype = window.Event.prototype;
//
//   window.CustomEvent = CustomEvent;
// }
// // Unified Ajax request interception
// function ajaxEventTrigger (event) {
//   var ajaxEvent = new CustomEvent(event, { detail: this })
//   window.dispatchEvent(ajaxEvent)
// }
//
// // Browser detection function
// function myBrowser() {
//   var userAgent = navigator.userAgent; // Get browser's userAgent string
//   var isOpera = userAgent.indexOf("Opera") > -1;
//   if (isOpera) { // Check if Opera browser
//     return "Opera"
//   }
//   if (userAgent.indexOf("Firefox") > -1) { // Check if Firefox browser
//     return "FF";
//   }
//   if (userAgent.indexOf("Chrome") > -1) {
//     return "Chrome";
//   }
//   if (userAgent.indexOf("Safari") > -1) { // Check if Safari browser
//     return "Safari";
//   }
//   if (isIE() && !isOpera) { // Check if IE browser
//     return "IE";
//   }
// }
// var oldXHR = window.XMLHttpRequest;
// function newXHR () {
//   var realXHR = new oldXHR()
//   realXHR.addEventListener('readystatechange', function () { ajaxEventTrigger.call(this, 'ajaxReadyStateChange') }, false)
//   return realXHR
// }
// window.XMLHttpRequest = newXHR
// var startTime = 0
// var gapTime = 0 // Calculate request delay
// window.addEventListener('ajaxReadyStateChange', function (e) {
//   var xhr = e.detail
//   var status = xhr.status
//   var readyState = xhr.readyState
//   /**
//    * Calculate request delay
//    */
//   if (readyState === 1) {
//     startTime = (new Date()).getTime()
//   }
//   if (readyState === 4) {
//     gapTime = (new Date()).getTime() - startTime
//   }
//   /**
//    * Report request information
//    */
//   if (readyState === 4) {
//     if(status === 200){
//       // Log API response time when interface responds normally
//       console.log('API', xhr.responseURL, 'Response time', gapTime, myBrowser())
//     }else{
//       // Log abnormal interface and status code when API fails
//       console.log('Abnormal API', xhr.responseURL, 'Status code', status, myBrowser())
//     }
//   }
// })
