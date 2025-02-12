<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" :disabled="option === ''" @on-click="showModal(option)">Edit</m-button>
    </div>
    <div slot="page-content">
      <div class="table">
        <div class="table-tr" @click="handleClick" id="firewall" :class="{ 'single-selected': option === 'firewall' }">
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input type="radio" value="enable" name="option" v-model="option" />
              <div></div>
            </label>
          </div>
          <div class="table-td">Firewall</div>
          <div class="table-td">
            {{ db.optionObj && db.optionObj.enable == 1 ? "Yes" : "No" }}
            <i class="el-icon-edit edit-icon" @click="showModal('firewall')"></i>
          </div>
        </div>
        <div class="table-tr" @click="handleClick" id="ebtables" :class="{ 'single-selected': option === 'ebtables' }">
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input type="radio" value="ebtables" name="option" v-model="option" />
              <div></div>
            </label>
          </div>
          <div class="table-td">ebtables</div>
          <div class="table-td">
            {{ db.optionObj && db.optionObj.ebtables === 1 ? "Yes" : "No" }}
            <i class="el-icon-edit edit-icon" @click="showModal('ebtables')"></i>
          </div>
        </div>
        <div class="table-tr" @click="handleClick" id="log_ratelimit"
          :class="{ 'single-selected': option === 'log_ratelimit' }">
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input type="radio" value="log_ratelimit" name="option" v-model="option" />
              <div></div>
            </label>
          </div>
          <div class="table-td">Log Rate Limit</div>
          <div class="table-td">
            {{ db.optionObj && render_kvm_console(db.optionObj.log_ratelimit) }}
            <i class="el-icon-edit edit-icon" @click="showModal('log_ratelimit')"></i>
          </div>
        </div>
        <div class="table-tr" @click="handleClick" id="policy_in"
          :class="{ 'single-selected': option === 'policy_in' }">
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input type="radio" value="policy_in" name="option" v-model="option" />
              <div></div>
            </label>
          </div>
          <div class="table-td">Input Policy</div>
          <div class="table-td">
            {{
              db.optionObj && db.optionObj.policy_in
                ? db.optionObj.policy_in
                : "root@$hostname"
            }}
            <i class="el-icon-edit edit-icon" @click="showModal('policy_in')"></i>
          </div>
        </div>
        <div class="table-tr" @click="handleClick" id="policy_out"
          :class="{ 'single-selected': option === 'policy_out' }">
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input type="radio" value="policy_out" name="option" v-model="option" />
              <div></div>
            </label>
          </div>
          <div class="table-td">Output Policy</div>
          <div class="table-td">
            {{
              db.optionObj && db.optionObj.policy_out
                ? db.optionObj.policy_out
                : "None"
            }}
            <i class="el-icon-edit edit-icon" @click="showModal('policy_out')"></i>
          </div>
        </div>
      </div>
      <OptionModal :visible="visible" v-if="visible" :title="title" @close="
        visible = false;
      __init__();
      " :type="type"></OptionModal>
    </div>
  </page-template>
</template>
<script>
import FirewallHttp from "@src/views/home/dataCenter/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { KVM_KEYMAPS, CONSOLE_Map } from "@libs/enum/enum.js";
import { printPropertyString } from "@libs/utils/index";
import OptionModal from "./OptionModal";
export default {
  name: "HaFirOptions",
  mixins: [FirewallHttp],
  components: {
    PageTemplate,
    MButton,
    OptionModal,
  },
  data() {
    return {
      type: "",
      visible: false,
      option: "",
      title: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    __init__() {
      this.queryFireOptionList();
    },
    //Click event triggered when clicking table row
    handleClick(event) {
      this.option = event.target.parentElement.id;
    },
    //Render keyboard language
    render_kvm_language(value) {
      if (!value || value === "__default__") {
        return "Default";
      }
      var text = KVM_KEYMAPS[value];
      if (text) {
        return text + " (" + value + ")";
      }
      return value;
    },
    //Render console
    render_kvm_console(value) {
      if (!value || value === "__default__") {
        return "Default";
      }
      var text = CONSOLE_Map[value];
      if (text) {
        return text;
      }
      return value;
    },
    //Render high availability
    render_dc_ha_opts: function (value) {
      if (!value) {
        return "Default";
      } else {
        return printPropertyString(value);
      }
    },
    //Render network
    render_as_property_string: function (value) {
      return !value ? "Default" : printPropertyString(value);
    },
    showModal(key) {
      this.type = key;
      switch (key) {
        case "firewall":
          this.title = "Edit: Firewall";
          break;
        case "ebtables":
          this.title = "Edit: ebtables";
          break;
        case "log_ratelimit":
          this.title = "Edit: Log Rate Limit";
          break;
        case "policy_in":
          this.title = "Edit: Input Direction";
          break;
        case "policy_out":
          this.title = "Edit: Output Direction";
          break;
      }
      this.visible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.cluster-desc {
  display: flex;
  margin: 10px 0px;
  padding: 10px 0px;
  border-top: 1px solid #c4d6ec;
  border-bottom: 1px solid #c4d6ec;

  &__item {
    flex: 1 1 auto;
    display: flex;
  }

  &__title {
    flex: 1 1 auto;
    display: inline-flex;
  }

  &__desc {
    flex: 1 1 auto;
    display: inline-flex;
  }
}

.table {
  &-tr {
    height: 35px;
    line-height: 35px;
    width: 100%;
    cursor: pointer;
  }

  &-td {
    height: 35px;
    line-height: 35px;
    width: 50%;
  }

  &-radio {
    width: 50px;
    padding-right: 20px;
  }
}
</style>
