<template>
  <Dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content" v-if="modalType !== 'sync'">
        <div class="m-form__section">
          <dl>
            <dt></dt>
            <dd>
              <m-tab v-model="tab" @tab-click="handleTabChange" v-if="!['pve', 'pam'].includes(param.type)">
                <m-tab-panel label="General" name="general"></m-tab-panel>
                <m-tab-panel label="Sync Options" name="sync"></m-tab-panel>
              </m-tab>
            </dd>
          </dl>
          <dl v-if="tab === 'general'">
            <dt>Basic Information</dt>
            <dd>
              <m-input type="text" prop="realm" labelWidth="100px" label="Realm" v-model="realm" validateEvent
                @validate="validate" :show-error="rules.realm.error" :error-msg="rules.realm.message"
                :disabled="!isCreate" placeholder="Please enter group" />
              <m-input type="text" prop="server1" labelWidth="100px" label="Server" v-model="server1" validateEvent
                :disabled="!isCreate" :show-error="rules.server1.error" :error-msg="rules.server1.message"
                placeholder="Please enter server" v-if="!['pve', 'pam'].includes(param.type)" />
              <m-input type="text" prop="domain" labelWidth="100px" label="Domain" v-model="domain" validateEvent
                @validate="validate" v-if="_type === 'ad' && !['pve', 'pam'].includes(param.type)"
                :show-error="rules.domain.error" :error-msg="rules.domain.message" :disabled="!isCreate"
                placeholder="company.net" />
              <m-input type="text" prop="base_dn" labelWidth="100px" label="Base DN" v-model="base_dn" validateEvent
                @validate="validate" v-if="_type === 'ldap' && !['pve', 'pam'].includes(param.type)"
                :show-error="rules.base_dn.error" :error-msg="rules.base_dn.message" :disabled="!isCreate"
                placeholder="CN=Users,DC=Company,DC=net" />
              <m-input type="text" prop="server2" labelWidth="100px" label="Backup Server" v-model="server2"
                v-if="!['pve', 'pam'].includes(param.type)" placeholder="Please enter backup server" />
              <m-input type="text" prop="user_attr" labelWidth="100px" label="Username Attribute" v-model="user_attr"
                validateEvent @validate="validate" v-if="_type === 'ldap' && !['pve', 'pam'].includes(param.type)"
                :show-error="rules.user_attr.error" :error-msg="rules.user_attr.message"
                placeholder="uid / sAMAccountName" />
              <m-input type="number" prop="port" labelWidth="100px" label="Port" v-model="port"
                v-if="!['pve', 'pam'].includes(param.type)" placeholder="Please enter port" />
              <m-select prop="roles" label="Require TFA" labelWidth="100px" @on-change="handleTfaSelect" v-model="tfa"
                placeholder="Please select role">
                <m-option v-for="item in tfaOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-checkbox label="SSL" v-model="secure" v-if="!['pve', 'pam'].includes(param.type)"
                labelWidth="100px"></m-checkbox>
              <m-checkbox label="Default" v-model="default1" labelWidth="100px"></m-checkbox>
              <m-input type="number" prop="step" labelWidth="100px" label="Time Step" v-if="tfa === 'oath'" min="3"
                v-model="step" placeholder="Please enter step" />
              <m-input type="number" prop="digits" labelWidth="100px" label="Secret Length" v-if="tfa === 'oath'"
                min="6" max="8" v-model="digits" placeholder="Please enter Secret Length" />
              <m-input type="text" prop="id" labelWidth="100px" label="Yubico API Id" v-model="id"
                v-if="tfa === 'yubico'" @validate="validate" :show-error="rules.id.error" :error-msg="rules.id.message"
                placeholder="Please enter Yubico API Id" />
              <m-input type="text" prop="key" labelWidth="100px" v-if="tfa === 'yubico'" label="Yubico API Key"
                v-model="key" @validate="validate" :show-error="rules.key.error" :error-msg="rules.key.message"
                placeholder="Please enter Yubico API Key" />
              <m-input type="text" prop="url" v-if="tfa === 'yubico'" labelWidth="100px" label="URL" v-model="url"
                placeholder="Please enter URL" />
              <m-input type="textarea" prop="comment" labelWidth="100px" label="Comment" v-model="comment"
                placeholder="Please enter comment" />
            </dd>
          </dl>
          <dl v-if="tab === 'sync'">
            <dt>Basic Information</dt>
            <dd>
              <m-input type="text" prop="bind_dn" labelWidth="100px" label="Bind User" v-model="bind_dn"
                placeholder="Please enter backup server" />
              <m-input type="text" prop="user_classes" labelWidth="100px" label="User Classes" v-model="user_classes"
                placeholder="inetorgperson, posixaccount, person, user" />
              <m-input type="text" prop="password" labelWidth="100px" label="Bind Password" v-model="password"
                placeholder="Please enter backup server" />
              <m-input type="text" prop="group_classes" labelWidth="100px" label="Group Classes" v-model="group_classes"
                placeholder="groupOfNames, group, univentionGroup, ipausergroup" />
              <m-input type="text" prop="email" labelWidth="100px" label="E-Mail Attribute" v-model="email"
                placeholder="Please enter E-Mail attribute" />
              <m-input type="text" prop="filter" labelWidth="100px" label="User Filter" v-model="filter"
                placeholder="Please enter backup server" />
              <m-input type="text" prop="group_name_attr" labelWidth="100px" label="Group Name Attribute"
                v-model="group_name_attr" placeholder="Please enter group name attribute" />
              <m-input type="text" prop="group_filter" labelWidth="100px" label="Group Filter" v-model="group_filter"
                placeholder="Please enter Group Filter" />
            </dd>
            <dt>Default Sync Options</dt>
            <dd>
              <m-select prop="scope" label="Scope" labelWidth="100px" @on-change="handleScopeSelect" v-model="scope"
                placeholder="Please select scope">
                <m-option v-for="item in scopeOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-select prop="enable-new" label="Enable New Users" labelWidth="100px" @on-change="handleEnableNewSelect"
                v-model="enableNew" placeholder="Please select role">
                <m-option v-for="item in enableNewOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-select prop="full" label="Full" labelWidth="100px" @on-change="handleFullSelect" v-model="full"
                placeholder="Please select role">
                <m-option v-for="item in fullOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-select prop="purge" label="Purge" labelWidth="100px" @on-change="handlePurgeSelect" v-model="purge"
                placeholder="Please select role">
                <m-option v-for="item in fullOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
      <div class="m-form__content" v-if="modalType === 'sync'">
        <div class="m-form__section">
          <dt>Default Sync Options</dt>
          <dd>
            <m-select prop="scope" label="Scope" labelWidth="100px" @on-change="handleScopeSelect" v-model="scope"
              placeholder="Please select scope">
              <m-option v-for="item in scopeOptions" :key="item.value" :label="item.label" :value="item.value">
              </m-option>
            </m-select>
            <m-select prop="enable-new" label="Enable New Users" labelWidth="100px" @on-change="handleEnableNewSelect"
              v-model="enableNew" placeholder="Please select role">
              <m-option v-for="item in enableNewOptions" :key="item.value" :label="item.label" :value="item.value">
              </m-option>
            </m-select>
            <m-select prop="full" label="Full" labelWidth="100px" @on-change="handleFullSelect" v-model="full"
              placeholder="Please select role">
              <m-option v-for="item in fullOptions" :key="item.value" :label="item.label" :value="item.value">
              </m-option>
            </m-select>
            <m-select prop="purge" label="Purge" labelWidth="100px" @on-change="handlePurgeSelect" v-model="purge"
              placeholder="Please select role">
              <m-option v-for="item in fullOptions" :key="item.value" :label="item.label" :value="item.value">
              </m-option>
            </m-select>
          </dd>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
export default {
  name: "CreateAccessDomainModal",
  mixins: [DataCenterAccessHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    _type: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      realm: "",
      comment: "",
      domain: "",
      server1: "",
      server2: "",
      digits: 6,
      step: 30,
      id: "",
      key: "",
      url: "",
      tab: "general",
      tfa: "__default__",
      secure: false,
      default1: false,
      full: "__default__",
      purge: "__default__",
      enableNew: "__default__",
      scope: "__default__",
      port: "",
      bind_dn: "",
      group_classes: "",
      user_classes: "",
      password: "",
      group_filter: "",
      group_name_attr: "",
      filter: "",
      email: "",
      base_dn: "",
      user_attr: "",
      tfaOptions: [
        {
          value: "__default__",
          label: "None",
        },
        {
          value: "oath",
          label: "oath",
        },
        {
          value: "yubico",
          label: "yubico",
        },
      ],
      scopeOptions: [
        { value: "__default__", label: "None" },
        { value: "users", label: "Users" },
        { value: "groups", label: "Groups" },
        { value: "both", label: "Users and Groups" },
      ],
      enableNewOptions: [
        { value: "__default__", label: "Yes (Default)" },
        { value: "1", label: "Yes" },
        { value: "0", label: "No" },
      ],
      fullOptions: [
        { value: "__default__", label: "None" },
        { value: "1", label: "Yes" },
        { value: "0", label: "No" },
      ],
      rules: {
        realm: {
          error: false,
          message: "",
        },
        domain: {
          error: false,
          message: "",
        },
        server1: {
          error: false,
          message: "",
        },
        id: {
          error: false,
          message: "",
        },
        key: {
          error: false,
          message: "",
        },
        base_dn: {
          error: false,
          message: "",
        },
        user_attr: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
    console.log(this.modalType);
  },
  methods: {
    async __init__() {
      if (this.modalType === "create")
        Object.assign(this.$data, this.$options.data());
      else {
        debugger;
        Object.assign(this.$data, this.$options.data());
        await this.queryDomainById({ realm: this.param.realm }).then(() => {
          Object.keys(this.db.domainsObj).forEach((it) => {
            this[it] = this.db.domainsObj[it];
          });
          debugger;
          this.realm = this.param.realm;
        });
      }
    },
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty";
        return;
      }
    },
    validateAll() {
      let props = ["realm", "domain", "server1"];
      if (this.tfa === "yubico") props = props.concat("id", "key");
      if (this._type === "ldap") {
        props = props.concat("user_attr", "base_dn");
        props.splice(props.indexOf("domain"), 1);
      }
      if (["pam", "pve"].includes(this.param.type)) {
        props = [];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleTabChange(value) {
      this.tab = value;
    },
    handleTfaSelect(value) {
      this.tfa = value;
    },
    handleScopeSelect(value) {
      this.scope = value;
    },
    handleEnableNewSelect(value) {
      this.enableNew = value;
    },
    handleFullSelect(value) {
      this.full = value;
    },
    handlePurgeSelect(value) {
      this.purge = value;
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        realm: this.realm,
        domain: this.domain,
        default: 1,
        server1: this.server1,
        server2: this.server2,
        port: this.port,
        secure: this.secure ? 1 : 0,
        comment: this.comment,
        bind_dn: this.bind_dn,
        password: this.password,
        group_name_attr: this.group_name_attr,
        user_classes: this.user_classes,
        group_classes: this.group_classes,
        filter: this.filter,
        group_filter: this.group_filter,
        type: this._type,
      };
      if (this.tfa === "oath") {
        param["tfa"] = "";
        if (this.digits) {
          param["tfa"] += `digits=${this.digits}`;
        }
        if (this.step) {
          param["tfa"] += `,step=${this.step}`;
        }
        param["tfa"] += `,type=oath`;
      }
      if (this.tfa === "yubico") {
        param["tfa"] = "";
        if (this.id) {
          param["tfa"] += `id=${this.id}`;
        }
        if (this.key) {
          param["tfa"] += `,key=${this.key}`;
        }
        if (this._type) {
          param["tfa"] += `,type=${this._type}`;
        }
        if (this.url) {
          param["tfa"] += `,url=${this.url}`;
        }
      }
      param["tfa"] = param["tfa"] && param["tfa"].replace(/^[,]/, "");
      if (this._type === "ldap") {
        delete param.domain;
        param["base_dn"] = this.base_dn;
        param["user_attr"] = this.user_attr;
      }
      Object.keys(param).forEach((item) => {
        if (!param[item]) delete param[item];
      });
      if (this.email) param["sync_attributes"] = `email=${this.email}`;
      if (this.isCreate) {
        this.createAccessDomain(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
                type: "error",
              })
              .then(() => { })
              .catch(() => { });
          });
      } else if (this.modalType === "sync") {
        let param = {
          scope: this.scope === "__default__" ? "users" : this.scope,
          full: this.full === "__default__" ? 0 : this.full,
          "enable-new": this.enableNew === "__default__" ? 0 : this.enableNew,
          purge: this.purge === "__default__" ? 0 : this.purge,
          "dry-run": 0,
        };
        this.syncAccessDomainById(this.realm, param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
                type: "error",
              })
              .then(() => { })
              .catch(() => { });
          });
      } else {
        this.updateDomain(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
                type: "error",
              })
              .then(() => { })
              .catch(() => { });
          });
      }
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>
