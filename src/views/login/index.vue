<template>
  <div class="pve-login">
    <div class="pve-login_content clearfix">
      <div class="pve-login_content__left"></div>
      <div class="pve-login_content__right">
        <div class="pve-login_content__form">
          <h1 class="pve-login_content__form-title">{{ $t("login.title") }}</h1>
          <div class="pve-login_content__form-item">
            <input :placeholder="$t('login.username.placeholder')" type="text" @blur="validate('username')"
              @input="validate('username')" :class="{ 'error-input': emptyusername }" v-model="username" />
            <span class="icon icon-user"></span>
            <div class="error error-msg" v-if="emptyusername">
              {{ $t("login.username.empty") }}
            </div>
            <div class="error error-msg" v-else-if="invalidusername">
              Username or password incorrect
            </div>
          </div>
          <div class="pve-login_content__form-item">
            <input :placeholder="$t('login.password.placeholder')" type="password" @blur="validate('password')"
              @input="validate('password')" :class="{ 'error-input': emptypassword }" v-model="password" />
            <span class="icon icon-password"></span>
            <div class="error error-msg" v-if="emptypassword">
              {{ $t("login.password.empty") }}
            </div>
            <div class="error error-msg" v-else-if="invalidpassword">
              Username or password incorrect
            </div>
          </div>
          <div class="pve-login_content__form-select">
            <div class="pv-form-select-wrapper width-12">
              <select class="pv-form-input" v-model="realm">
                <option v-for="item of realmList" :key="item.realm" :value="item.realm">
                  {{ item.comment }}
                </option>
              </select>
            </div>
          </div>
          <div class="pve-login_content__form-select">
            <div class="pv-form-select-wrapper width-12">
              <select class="pv-form-input" v-model="lang" @change="changeLang">
                <option v-for="item of langList" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="pve-login_content__form-item">
            <input type="submit" :value="$t('login.title')" @click="login" />
            <Loading class="loading" v-show="loading" bgColor="#fff"></Loading>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  setCookie,
  getEvent,
  getCookie,
  debounce,
  getEventTarget,
  quickSort,
} from "@libs/utils/index.js";
import Loading from "@src/components/loading/loading";
import VuexMixins from "@src/mixins/VuexMixins";
export default {
  name: "Login",
  mixins: [VuexMixins],
  components: {
    Loading,
  },
  data() {
    return {
      realm: "",
      lang:
        getCookie("PVELangCookie") ||
        setCookie("PVELangCookie", "zh_CN") ||
        "zh_CN", // Set default display language
      loading: false,
      realmList: [],
      // Language selection box
      langList: [
        {
          value: "zh_CN",
          label: "Chinese (Simplified)",
        },
        {
          value: "en",
          label: "English",
        },
      ],
      username: "",
      password: "",
      emptyusername: false,
      invalidusername: false,
      emptypassword: false,
      invalidpassword: false,
    };
  },
  methods: {
    // Single validation
    validate(name) {
      let input = String(this[name]).trim();
      this[`empty${name}`] = false;
      this[`invalid${name}`] = false;
      if (/^\s*$/.test(input)) {
        this[`empty${name}`] = true;
      }
    },
    // Overall validation
    validateAll() {
      let props = ["username", "password"];
      props.forEach((prop) => this.validate(prop));
      // Cannot login if validation fails
      return props.some(
        (prop) =>
          this[`empty${prop}`] === true || this[`invalid${prop}`] === true
      );
    },
    // Press Enter to login
    keyCodeLogin(event) {
      if (event.keyCode === 13) {
        this.login();
      }
    },
    // Login interface
    login() {
      if (this.validateAll()) return;
      this.loading = true;
      this.$http
        .ajax(
          "/json/access/ticket",
          {
            username: this.username,
            password: this.password,
            realm: this.realm,
          },
          "post",
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then((res) => {
          if (res.data) {
            // Store token in local storage after successful login
            window.localStorage.setItem(
              "CSRFPreventionToken",
              res.data.CSRFPreventionToken || ""
            );
            // Set cookie
            setCookie("PVEAuthCookie", res.data.ticket, null, "/", null, false);
            this.updateDB({
              dbName: "cap",
              obj: res.data.cap,
            });
            this.updateDbObject({
              name: "ticket",
              data: res.data,
            });
            window.localStorage.setItem(
              "ticket",
              JSON.stringify(res.data) || ""
            );
            // Redirect to last login route if available
            let lastLink = window.localStorage.getItem("lastLink") || "";
            this.update401Count({
              response401count: 0,
              silenceAuthFailures: true,
            });
            if (lastLink) {
              this.$router.push({ path: lastLink });
            } else {
              // Redirect to regional center overview page when no last login route exists and set route as last login page
              this.$router.push({ path: "/datacenter/overview" });
              window.localStorage.setItem("lastLink", "datacenter/overview");
            }
          }
          this.loading = false;
        })
        .catch(() => {
          this.invalidpassword = true;
          this.invalidusername = true;
          this.loading = false;
          this.update401Count({
            response401count: 0,
            silenceAuthFailures: false,
          });
        });
    },
    // Change internationalization
    changeLang(event) {
      let ev = getEvent(event);
      setCookie("PVELangCookie", getEventTarget(ev).value);
      window.location.href = "/login";
    },
    // Query domain
    queryDomain() {
      this.$http.get("json/access/domains").then((res) => {
        if (res.data) {
          this.realmList = quickSort(res.data, "realm", "+");
          this.realm = this.realmList[0].realm;
        }
      });
    },
  },
  mounted() {
    this.queryDomain();
    // Listen for keyup events when Enter is pressed to submit the form
    window.addEventListener("keyup", this.keyCodeLogin, false);
  },
  beforeDestroy() {
    // Destroy listener
    window.removeEventListener("keyup", this.keyCodeLogin, false);
  },
};
</script>

<style scoped lang="less">
@import "~@view/login/login.less";
</style>
