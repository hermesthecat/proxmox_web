<template>
  <Dialog :visible="visible" @close="close()" :drag="false" :title="title" :_style="{
    height: '300px',
  }">
    <template slot="content" v-if="type === 'ha'">
      <div class="option-tr">
        <label>Shutdown Policy</label>
        <div class="option-item">
          <Dropdown trigger="click" @on-change="handleCommand">
            <span slot="label">{{ kvm_ha_map[ha] }}</span>
            <DropdownItem v-for="(value, key) of kvm_ha_map" :command="key" :key="key">{{ value }}</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'http_proxy'">
      <div class="option-tr">
        <label>HTTP Proxy</label>
        <div class="option-item">
          <m-input placeholder="None" prop="http_proxy" validateEvent @validate="validate" required
            :error-msg="rules.http_proxy.message" :show-error="rules.http_proxy.error" v-model="http_proxy" />
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'email_from'">
      <div class="option-tr">
        <label>Email From Address</label>
        <div class="option-item">
          <m-input placeholder="root@$hostname" prop="email_from" validateEvent @validate="validate"
            :error-msg="rules.email_from.message" :show-error="rules.email_from.error" v-model="email_from" />
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'mac_prefix'">
      <div class="option-tr">
        <label>MAC Address Prefix</label>
        <div class="option-item">
          <m-input placeholder="None" prop="mac_prefix" validateEvent @validate="validate"
            :error-msg="rules.mac_prefix.message" :show-error="rules.mac_prefix.error" v-model="mac_prefix" />
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'console'">
      <div class="option-tr">
        <label>Console Viewer</label>
        <div class="option-item">
          <Dropdown trigger="click" @on-change="handleCommand">
            <span slot="label">{{ console_map[console] }}</span>
            <DropdownItem v-for="(value, key) of console_map" :command="key" :key="key">{{ value }}</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'migration'">
      <div class="option-tr">
        <label>Type</label>
        <div class="option-item">
          {{ secutity }}
        </div>
      </div>
      <div class="option-tr">
        <label>Network</label>
        <div class="option-item">
          <el-table :data="netWorkList" @current-change="handleLink1Change" highlight-current-row>
            <el-table-column width="50">
              <template slot-scope="scope">
                <el-radio :label="scope.row.cidr" v-model="link1Radio">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column label="CIDR" prop="cidr" sortable></el-table-column>
            <el-table-column label="Interface" prop="iface" sortable></el-table-column>
            <el-table-column label="Active" prop="active">
              <template slot-scope="scope">
                <table-info-state :content="scope.row.active === 1 ? 'Yes' : 'No'"
                  :state="scope.row.active === 1 ? 'actived' : 'unactived'"></table-info-state>
              </template>
            </el-table-column>
            <el-table-column label="Comment" prop="comment"></el-table-column>
          </el-table>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'keyboard'">
      <div class="option-tr">
        <label>Keyboard Layout</label>
        <div class="option-item">
          <Dropdown trigger="click" @on-change="handleCommand">
            <span slot="label">{{ kvm_keymaps[keyboard] }}</span>
            <DropdownItem v-for="(value, key) of kvm_keymaps" :command="key" :key="key">{{ value }}</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </template>
    <template slot="footer">
      <template>
        <m-button class="create-btn" type="primary" @on-click="close()">Cancel</m-button>
        <m-button class="create-btn" type="primary" @on-click="confirm()" :disabled="instate()">OK</m-button>
      </template>
    </template>
  </Dialog>
</template>

<script>
import DropdownItem from "@src/components/dropdown/dropdownItem";
import { KVM_KEYMAPS, CONSOLE_Map, KVM_HA_Map } from "@libs/enum/enum.js";
import { httpProxy, macPrefix, proxmoxMail } from "@libs/utils/index.js";
import OptionHttp from "@src/views/home/dataCenter/option/http";
import Dropdown from "@src/components/dropdown/dropdown";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
export default {
  name: "OptionModal",
  mixins: [OptionHttp],
  components: {
    Dialog,
    DropdownItem,
    Dropdown,
    MButton,
  },
  props: {
    // Whether the configuration dialog is visible
    visible: {
      type: Boolean,
      default: false,
    },
    // Show corresponding configuration based on different types
    type: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      kvm_ha_map: KVM_HA_Map,
      console_map: CONSOLE_Map,
      kvm_keymaps: KVM_KEYMAPS,
      keyboard: "",
      ha: "",
      console: "",
      http_proxy: "",
      email_from: "",
      mac_prefix: "",
      secutity: "secure",
      netWorkList: [],
      link1Radio: "",
      // Validation rules
      rules: {
        http_proxy: {
          error: false,
          message: "",
        },
        email_from: {
          error: false,
          message: "",
        },
        mac_prefix: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    // Set default selection or input
    switch (this.type) {
      case "keyboard":
        this.keyboard =
          this.db.optionObj && this.db.optionObj.keyboard
            ? this.db.optionObj.keyboard
            : "__default__";
        break;
      case "console":
        this.console =
          this.db.optionObj && this.db.optionObj.console
            ? this.db.optionObj.console
            : "__default__";
        break;
      case "ha":
        this.ha =
          this.db.optionObj && this.db.optionObj.ha
            ? this.db.optionObj.ha.shutdown_policy
            : "__default__";
      case "email_from":
        this.email_from =
          this.db.optionObj && this.db.optionObj.email_from
            ? this.db.optionObj.email_from
            : "";
      case "http_proxy":
        this.http_proxy =
          this.db.optionObj && this.db.optionObj.http_proxy
            ? this.db.optionObj.http_proxy
            : "";
      case "mac_prefix":
        this.mac_prefix =
          this.db.optionObj && this.db.optionObj.mac_prefix
            ? this.db.optionObj.mac_prefix
            : "";
        break;
    }
    if (this.type === "migration")
      this.queryClusterNetWork().then(() => {
        this.netWorkList = this.db.netWorkList.filter((item) => {
          if (item.cidr) {
            return item;
          }
        });
      });
  },
  methods: {
    // Close dialog
    close() {
      this.$emit("close");
    },
    // Select different options
    handleCommand(prop) {
      this[this.type] = prop;
    },
    // Confirm modification
    confirm() {
      let param;
      if (this.validateAll()) return;
      switch (this.type) {
        case "keyboard":
          param =
            this.keyboard === "__default__"
              ? {
                delete: "keyboard",
              }
              : {
                keyboard: this.keyboard,
              };
          break;
        case "console":
          param =
            this.console === "__default__"
              ? {
                delete: "console",
              }
              : {
                console: this.console,
              };
          break;
        case "ha":
          param =
            this.ha === "__default__"
              ? {
                delete: "ha",
              }
              : {
                ha: `shutdown_policy=${this.ha}`,
              };
          break;
        case "email_from":
          param =
            this.email_from === ""
              ? {
                delete: "email_from",
              }
              : {
                email_from: this.email_from,
              };
          break;
        case "http_proxy":
          param =
            this.http_proxy === ""
              ? {
                delete: "http_proxy",
              }
              : {
                http_proxy: this.http_proxy,
              };
          break;
        case "mac_prefix":
          param =
            this.mac_prefix === ""
              ? {
                delete: "mac_prefix",
              }
              : {
                mac_prefix: this.mac_prefix,
              };
          break;
        case "migration":
          param = {
            migration: this.link1Radio
              ? `network=${this.link1Radio},type=secure`
              : `type=secure`,
          };
          break;
      }
      this.modifyOptions(param).then(() => {
        this.close();
      });
    },
    // Overall validation
    validateAll() {
      let props = [];
      if (this.type === "http_proxy") props.push("http_proxy");
      if (this.type === "email_from") props.push("email_from");
      if (this.type === "mac_prefix") props.push("mac_prefix");
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    // Single validation
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (value && prop === "http_proxy" && !httpProxy(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Must start with http://";
        return;
      }
      if (value && prop === "email_from" && !proxmoxMail(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Please enter a valid email address";
        return;
      }
      if (value && prop === "mac_prefix" && !macPrefix(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Example: 02:8f - Only unicast addresses allowed";
        return;
      }
    },
    // Select network
    handleLink1Change(row) {
      this.link1Radio = row.cidr;
    },
    // Set disabled value
    instate() {
      if (["http_proxy", "email_from", "mac_prefix"].includes(this.type)) {
        if (
          this.$data[this.type] ===
          (this.db.optionObj && this.db.optionObj[this.type]
            ? this.db.optionObj[this.type]
            : "")
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        if (
          this.$data[this.type] ===
          (this.db.optionObj && this.db.optionObj[this.type]
            ? this.db.optionObj[this.type]
            : "__default__")
        ) {
          return true;
        } else {
          return false;
        }
      }
    },
  },
};
</script>

<style scoped lang="less">
.option {
  &-tr {
    display: flex;
    height: 35px;
    line-height: 35px;

    label {
      flex: 1 1 auto;
    }
  }

  &-item {
    flex: 1 1 auto;
    width: 200px;
  }
}

.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
