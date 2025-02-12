<template>
  <Dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-select prop="type" label="Direction" labelWidth="100px" validateEvent @on-change="handleTypeSelect"
                v-model="type" v-show="modalType !== 'rule' && !isGroup" placeholder="Please select direction">
                <m-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-select prop="action" label="Security Group" labelWidth="100px" validateEvent
                @on-change="handleGroupSelect" v-model="action" @validate="validate('action')"
                :show-error="rules['action'].error" :error-msg="rules['action'].message" required
                v-show="modalType === 'rule' || isGroup" placeholder="Please select security group">
                <m-option v-for="(item, index) in db.fireWallGroupList" :key="item.group" :label="item.group"
                  :value="item.group">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Security Group</span>
                        <span class="table-td">Comment</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.group">{{
                        item.group
                      }}</span>
                      <span class="table-td" :title="item.comment">{{
                        item.comment
                      }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-checkbox label="Enable" v-model="enable" labelWidth="100px"></m-checkbox>
              <m-select prop="action" label="Action" labelWidth="100px" @on-change="handleActionSelect" v-model="action"
                :readonly="false" v-show="modalType !== 'rule' && !isGroup" placeholder="Please select action">
                <m-option v-for="item in actionOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-select prop="macro" label="Macro" labelWidth="100px" @on-change="handleMacroSelect" v-model="macro"
                placeholder="Please select macro" v-show="modalType !== 'rule' && !isGroup" :readonly="false">
                <m-option v-for="(item, index) in db.macrosList" :key="item.macro" :label="item.macro"
                  :value="item.macro">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Macro</span>
                        <span class="table-td">Description</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.macro">{{
                        item.macro
                      }}</span>
                      <span class="table-td" :title="item.descr">{{
                        item.descr
                      }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-input type="text" prop="iface" label="Interface" labelWidth="100px" v-model="iface"
                :placeholder="'Please enter interface'" />
              <m-select prop="proto" label="Protocol" labelWidth="100px" @on-change="handleProtoSelect" v-model="proto"
                :readonly="false" :disabled="macro !== ''" placeholder="Please select protocol"
                v-show="modalType !== 'rule' && !isGroup">
                <m-option v-for="(item, index) in portocalOptions" :key="item.p" :label="item.p" :value="item.p">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Protocol</span>
                        <span class="table-td">Number</span>
                        <span class="table-td">Description</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.p">{{ item.p }}</span>
                      <span class="table-td" :title="item.n">{{ item.n }}</span>
                      <span class="table-td" :title="item.d">{{ item.d }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select prop="source" label="Source" labelWidth="100px" @on-change="handleSourceSelect" v-model="source"
                :readonly="false" placeholder="Please select source" v-show="modalType !== 'rule' && !isGroup">
                <m-option v-for="(item, index) in db.fireWallResfList" :key="item.name" :label="item.ref"
                  :value="item.name">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Type</span>
                        <span class="table-td">Name</span>
                        <span class="table-td">Comment</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.type">{{
                        item.type
                      }}</span>
                      <span class="table-td" :title="item.name">{{
                        item.name
                      }}</span>
                      <span class="table-td" :title="item.ref">{{
                        item.ref
                      }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-input type="number" prop="sport" label="Source Port" labelWidth="100px" v-model="sport"
                :disabled="macro !== ''" :placeholder="'Please enter source port'"
                v-show="modalType !== 'rule' && !isGroup" />
              <m-select prop="dest" label="Destination" labelWidth="100px" @on-change="handleDestSelect" v-model="dest"
                :readonly="false" placeholder="Please select destination" v-show="modalType !== 'rule' && !isGroup">
                <m-option v-for="(item, index) in db.fireWallResfList" :key="item.name" :label="item.ref"
                  :value="item.name">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Type</span>
                        <span class="table-td">Name</span>
                        <span class="table-td">Comment</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.type">{{
                        item.type
                      }}</span>
                      <span class="table-td" :title="item.name">{{
                        item.name
                      }}</span>
                      <span class="table-td" :title="item.ref">{{
                        item.ref
                      }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-input type="number" prop="dport" label="Destination Port" labelWidth="100px" :disabled="macro !== ''"
                v-model="dport" v-show="modalType !== 'rule' && !isGroup"
                :placeholder="'Please enter destination port'" />
              <m-input type="textarea" prop="comment" label="Comment" labelWidth="100px" v-model="comment"
                placeholder="Please enter comment" />
            </dd>
          </dl>
          <dl v-if="isAdvice && modalType !== 'rule' && !isGroup">
            <dt>Advanced</dt>
            <dd>
              <m-select prop="log" label="Log Level" labelWidth="100px" @on-change="handleLogSelect" v-model="log"
                placeholder="Please select log level">
                <m-option v-for="item in logsOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <div class="label_box" v-show="modalType !== 'rule' && !isGroup">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>Advanced</div>
        </label>
      </div>
      <m-button class="create-btn" type="primary" @on-click="confirm">{{
        modalType === "eidt" ? "Update" : "Add"
      }}</m-button>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import FirewallHttp from "@src/views/home/dataCenter/firewall/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
import { PORTOCOLIST } from "@libs/enum/enum";
export default {
  name: "CreateAccessModal",
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
      type: "in",
      log: "nolog",
      action: "ACCEPT",
      enable: false,
      source: "",
      dport: "",
      sport: "",
      comment: "",
      macro: "",
      iface: "",
      dest: "",
      proto: "",
      portocalOptions: PORTOCOLIST,
      isAdvice: true,
      typeOptions: [
        { label: "In", value: "in" },
        { label: "Out", value: "out" },
      ],
      actionOptions: [
        { label: "Accept", value: "ACCEPT" },
        { label: "Drop", value: "DROP" },
        { label: "Reject", value: "REJECT" },
      ],
      logsOptions: [
        { label: "nolog", value: "nolog" },
        { label: "emerg", value: "emerg" },
        { label: "alert", value: "alert" },
        { label: "crit", value: "crit" },
        { label: "err", value: "err" },
        { label: "warning", value: "warning" },
        { label: "notice", value: "notice" },
        { label: "info", value: "info" },
        { label: "debug", value: "debug" },
      ],
      rules: {
        action: {
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
        await this.queryMacrosList();
        await this.queryRefsList();
      } else if (this.modalType === "copy" && !_this.isGroup) {
        // Copy security group when type is not group
        Object.assign(this.$data, this.$options.data());
        this.log = "";
        await this.queryMacrosList();
        await this.queryRefsList();
        Object.keys(this.param).forEach((it) => {
          this[it] = this.param[it];
        });
        this.enable === 1 ? (this.enable = true) : (this.enable = false);
        this.log ? (this.isAdvice = true) : (this.isAdvice = false);
        this.log = "nolog";
      } else if (this.modalType === "edit" && !_this.isGroup) {
        // Edit security group when type is not group
        Object.assign(_this.$data, _this.$options.data());
        await _this.queryMacrosList();
        await _this.queryRefsList();
        this.log = "";
        if (_this.param && String(_this.param.pos)) {
          _this.queryFireWallById(_this.param.pos).then(() => {
            Object.keys(_this.db.fireWallRuleObj).forEach((it) => {
              _this[it] = _this.db.fireWallRuleObj[it];
            });
            _this.enable === 1 ? (_this.enable = true) : (_this.enable = false);
            _this.log ? (_this.isAdvice = true) : (_this.isAdvice = false);
            _this.log = "nolog";
          });
        }
      } else if (this.modalType === "rule") {
        // Insert security group
        this.queryFireWallGroupList().then(() => {
          this.action = this.db.fireWallGroupList[0].group;
        });
      } else if (_this.isGroup && this.modalType === "edit") {
        // Edit security group when type is group
        this.queryFireWallGroupList().then(() => {
          this.action = this.db.fireWallGroupList[0].group;
        });
        Object.assign(_this.$data, _this.$options.data());
        _this.queryFireWallById(_this.param.pos).then(() => {
          Object.keys(_this.db.fireWallRuleObj).forEach((it) => {
            _this[it] = _this.db.fireWallRuleObj[it];
          });
          _this.enable === 1 ? (_this.enable = true) : (_this.enable = false);
        });
      }
    },
    handlePathSelect(value) {
      this.path = value;
    },
    handleDestSelect(value) {
      this.dest = value;
    },
    handleSourceSelect(value) {
      this.source = value;
    },
    handleTypeSelect(value) {
      this.type = value;
    },
    handleMacroSelect(value) {
      this.macro = value;
    },
    handleProtoSelect(value) {
      this.proto = value;
    },
    handleLogSelect(value) {
      this.log = value;
    },
    handleActionSelect(value) {
      this.action = value;
    },
    handleGroupSelect(value) {
      this.action = value;
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
      let props = [];
      if (this.modalType === "rule") props = ["action"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        type: this.type,
        enable: this.enable ? 1 : 0,
        source: this.source,
        dest: this.dest,
        sport: this.sport,
        proto: this.proto,
        comment: this.comment,
        action: this.action,
        dport: this.dport,
        iface: this.iface,
        macro: this.macro,
      };
      if (this.isAdvice) param.log = this.log;
      if (!this.iface) delete param.iface;
      if ((this.isCreate || this.modalType === "copy") && !this.isGroup) {
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
      } else if (this.modalType === "edit" && !this.isGroup) {
        param.digest = this.db.fireWallRuleObj.digest;
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
