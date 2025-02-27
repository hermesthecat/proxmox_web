<template>
  <Dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-input type="text" prop="name" label="Alias" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules['name'].error" :error-msg="rules['name'].message" v-model="name" required
                :placeholder="'Please enter alias'" />
              <m-input type="text" prop="cidr" label="IP/CIDR" labelWidth="100px" v-model="cidr" validateEvent
                @validate="validate" required :show-error="rules['cidr'].error" :error-msg="rules['cidr'].message"
                :placeholder="'Please enter IP/CIDR'" />
              <m-input type="textarea" prop="comment" label="Comment" labelWidth="100px" v-model="comment"
                placeholder="Please enter comment" />
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="confirm">{{
        modalType === "edit" ? "Update" : "Add"
      }}</m-button>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import FirewallHttp from "@src/views/home/dataCenter/firewall/http";
import {
  flotToFixed,
  percentToFixed,
  byteToSize,
  IP4_cidr_match,
  IP4_match,
  IP6_match,
  IP6_cidr_match,
} from "@libs/utils/index";
import { PORTOCOLIST } from "@libs/enum/enum";
export default {
  name: "CreateWallAliasModal",
  mixins: [FirewallHttp],
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
    isGroup: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cidr: "",
      name: "",
      comment: "",
      rules: {
        name: {
          error: false,
          message: "",
        },
        cidr: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    percentToFixed,
    byteToSize,
    async __init__() {
      let _this = this;
      // Create security group
      if (this.isCreate) {
        Object.assign(this.$data, this.$options.data());
      } else if (this.modalType === "edit") {
        // Edit security group when type is not group
        Object.assign(_this.$data, _this.$options.data());
        if (_this.param && String(_this.param.name)) {
          _this.queryFireWallAliasById(_this.param.name).then(() => {
            Object.keys(_this.db.fireWallAliasObj).forEach((it) => {
              _this[it] = _this.db.fireWallAliasObj[it];
            });
          });
        }
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
      debugger;
      if (
        prop === "cidr" &&
        !(
          IP6_match.test(value) ||
          IP4_match.test(value) ||
          IP6_cidr_match.test(value) ||
          IP4_cidr_match.test(value)
        )
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Invalid CIDR format";
        return;
      }
    },
    validateAll() {
      let props = ["cidr", "name"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        cidr: this.cidr,
        name: this.name,
        comment: this.comment,
      };
      if (this.isAdvice) param.log = this.log;
      if (!this.iface) delete param.iface;
      if (this.isCreate) {
        this.createFireWallAlias(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
      } else if (this.modalType === "edit") {
        param.digest = this.db.fireWallAliasObj.digest;
        param.rename = this.name;
        delete param.name;
        this.updateFireWallAlias(this.param.name, param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
      } else if (this.modalType === "rule") {
        let param = {
          type: "group",
          action: this.action,
          iface: this.iface,
          enable: this.enable ? 1 : 0,
          comment: this.comment,
        };
        this.createFireWall(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
      } else if (this.modalType === "edit" && this.isGroup) {
        param.digest = this.db.fireWallRuleObj.digest;
        param.type = "group";
        this.updateFireWall(this.param.pos, param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
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

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
