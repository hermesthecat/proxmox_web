<template>
  <Dialog
    :visible="visible"
    @close="close()"
    :drag="false"
    :title="title"
    :_style="{
      height: '300px',
      width: '900px',
    }"
  >
    <template slot="content" v-if="type === 'enable'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-checkbox
                label="Firewall"
                v-model="enable"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'dhcp'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-checkbox
                label="DHCP"
                v-model="dhcp"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'macfilter'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-checkbox
                label="MAC Filter"
                v-model="macfilter"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'ipfilter'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-checkbox
                label="IP Filter"
                v-model="ipfilter"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'ndp'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-checkbox
                label="NDP"
                v-model="ndp"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'radv'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-checkbox
                label="Router Advertisement"
                v-model="radv"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'log_level_in'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-select
                prop="log_level_in"
                label="log_level_in"
                @on-change="handleUnitSelect"
                v-model="log_level_in"
                placeholder="Please select operation"
              >
                <m-option
                  v-for="item in logsOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'log_level_out'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-select
                prop="log_level_out"
                label="log_level_out"
                @on-change="handleUnitSelect"
                v-model="log_level_out"
                placeholder="Please select operation"
              >
                <m-option
                  v-for="item in logsOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'policy_in'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-select
                prop="policy_in"
                label="Input Policy"
                @on-change="(value) => (policy_in = value)"
                v-model="policy_in"
                placeholder="Please select input policy"
              >
                <m-option
                  v-for="item in policyItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'policy_out'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-select
                prop="policy_out"
                label="Output Policy"
                @on-change="(value) => (policy_out = value)"
                v-model="policy_out"
                placeholder="Please select output policy"
              >
                <m-option
                  v-for="item in policyItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="footer">
      <template>
        <m-button class="create-btn" type="danger" @on-click="close()"
          >Cancel</m-button
        >
        <m-button class="create-btn" type="primary" @on-click="confirm()"
          >Confirm</m-button
        >
      </template>
    </template>
  </Dialog>
</template>

<script>
import QemuFirewallOptionHttp from "@src/views/home/qemu/firewall/options/http";
import DropdownItem from "@src/components/dropdown/dropdownItem";
import { KVM_KEYMAPS, CONSOLE_Map, KVM_HA_Map } from "@libs/enum/enum.js";
import { httpProxy, macPrefix, proxmoxMail } from "@libs/utils/index.js";
import Dropdown from "@src/components/dropdown/dropdown";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
export default {
  name: "NodeFireWallOptionModal",
  mixins: [QemuFirewallOptionHttp],
  components: {
    Dialog,
    DropdownItem,
    Dropdown,
    MButton,
  },
  props: {
    //Whether the configuration dialog is visible
    visible: {
      type: Boolean,
      default: false,
    },
    //Display corresponding configuration based on different types
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
      enable: true,
      dhcp: true,
      ndp: true,
      log_level_in: "nolog",
      log_level_out: "nolog",
      radv: false,
      macfilter: false,
      ipfilter: false,
      policy_in: "",
      policy_out: "",
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
      policyItems: [
        { label: "REJECT", value: "REJECT" },
        { label: "ACCEPT", value: "ACCEPT" },
        { label: "DROP", value: "DROP" },
      ],
      //Validation rules
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
  async mounted() {
    await this.queryQemuOption({ _dc: new Date().getTime() });
    //Set default selection or input
    if (
      ["enable", "ndp", "dhcp", "radv", "macfilter", "ipfilter"].includes(
        this.type
      )
    ) {
      this[this.type] =
        this.db.qemuFireWallOptionsObj &&
        this.db.qemuFireWallOptionsObj[this.type] &&
        this.db.qemuFireWallOptionsObj[this.type] === 1
          ? true
          : false;
    } else {
      this[this.type] =
        this.db.qemuFireWallOptionsObj &&
        this.db.qemuFireWallOptionsObj[this.type] &&
        this.db.qemuFireWallOptionsObj[this.type];
    }
  },
  methods: {
    //Close dialog
    close() {
      this.$emit("close");
    },
    //Select different options
    handleCommand(prop) {
      this[this.type] = prop;
    },
    //Confirm modification
    confirm() {
      let param = {};
      if (
        ["enable", "ndp", "dhcp", "radv", "macfilter", "ipfilter"].includes(
          this.type
        )
      ) {
        param[this.type] = this.$data[this.type] ? 1 : 0;
      } else {
        param[this.type] = this.$data[this.type];
      }
      param["digest"] = this.db.qemuFireWallOptionsObj.digest;
      if (!this.$data[this.type]) {
        delete param[this.type];
        param["delete"] = this.type;
      }
      this.modifyOptions(param)
        .then(() => {
          this.close();
        })
        .catch((res) => {
          this.$confirm
            .info({
              msg: res,
            })
            .then(() => {
              this.close();
            });
        });
    },
    //Select unit
    handleUnitSelect(value) {
      this.$data[this.type] = value;
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
