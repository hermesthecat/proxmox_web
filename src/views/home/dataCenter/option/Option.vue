<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        :disabled="option === ''"
        @on-click="showModal(option)"
        >Edit</m-button
      >
    </div>
    <div slot="page-content">
      <div class="table">
        <div
          class="table-tr"
          @click="handleClick"
          id="keyboard"
          :class="{ 'single-selected': option === 'keyboard' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                value="keyboard"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">Keyboard Layout</div>
          <div class="table-td">
            {{ db.optionObj && render_kvm_language(db.optionObj.keyboard) }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal('keyboard')"
            ></i>
          </div>
        </div>
        <div
          class="table-tr"
          @click="handleClick"
          id="http_proxy"
          :class="{ 'single-selected': option === 'http_proxy' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                value="http_proxy"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">HTTP Proxy</div>
          <div class="table-td">
            {{
              db.optionObj && db.optionObj.http_proxy
                ? db.optionObj.http_proxy
                : "None"
            }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal('http_proxy')"
            ></i>
          </div>
        </div>
        <div
          class="table-tr"
          @click="handleClick"
          id="console"
          :class="{ 'single-selected': option === 'console' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                value="console"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">Console Viewer</div>
          <div class="table-td">
            {{ db.optionObj && render_kvm_console(db.optionObj.console) }}
            <i class="el-icon-edit edit-icon" @click="showModal('console')"></i>
          </div>
        </div>
        <div
          class="table-tr"
          @click="handleClick"
          id="email_from"
          :class="{ 'single-selected': option === 'email_from' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                value="email_from"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">Email From Address</div>
          <div class="table-td">
            {{
              db.optionObj && db.optionObj.email_from
                ? db.optionObj.email_from
                : "root@$hostname"
            }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal('email_from')"
            ></i>
          </div>
        </div>
        <div
          class="table-tr"
          @click="handleClick"
          id="mac_prefix"
          :class="{ 'single-selected': option === 'mac_prefix' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                value="mac_prefix"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">MAC Address Prefix</div>
          <div class="table-td">
            {{
              db.optionObj && db.optionObj.mac_prefix
                ? db.optionObj.mac_prefix
                : "None"
            }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal('mac_prefix')"
            ></i>
          </div>
        </div>
        <div
          class="table-tr"
          @click="handleClick"
          id="migration"
          :class="{ 'single-selected': option === 'migration' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                value="migration"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">Migration Settings</div>
          <div class="table-td">
            {{
              db.optionObj && render_as_property_string(db.optionObj.migration)
            }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal('migration')"
            ></i>
          </div>
        </div>
        <div
          class="table-tr"
          @click="handleClick"
          id="ha"
          :class="{ 'single-selected': option === 'ha' }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input type="radio" value="ha" name="option" v-model="option" />
              <div></div>
            </label>
          </div>
          <div class="table-td">HA Settings</div>
          <div class="table-td">
            {{ db.optionObj && render_dc_ha_opts(db.optionObj.ha) }}
            <i class="el-icon-edit edit-icon" @click="showModal('ha')"></i>
          </div>
        </div>
      </div>
      <OptionModal
        :visible="visible"
        v-if="visible"
        :title="title"
        @close="
          visible = false;
          __init__();
        "
        :type="type"
      ></OptionModal>
    </div>
  </page-template>
</template>
<script>
import OptionHttp from "@src/views/home/dataCenter/option/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { KVM_KEYMAPS, CONSOLE_Map } from "@libs/enum/enum.js";
import { printPropertyString } from "@libs/utils/index";
import OptionModal from "./OptionModal";
export default {
  name: "Cluster",
  mixins: [OptionHttp],
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
      visible: false,
      title: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryOptionList();
    },
    // Click event for table row
    handleClick(event) {
      this.option = event.target.parentElement.id;
    },
    // Render keyboard language
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
    // Render console
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
    // Render high availability
    render_dc_ha_opts: function (value) {
      if (!value) {
        return "Default";
      } else {
        return printPropertyString(value);
      }
    },
    // Render network
    render_as_property_string: function (value) {
      return !value ? "Default" : printPropertyString(value);
    },
    showModal(key) {
      this.type = key;
      switch (key) {
        case "keyboard":
          this.title = "Edit: Keyboard Layout";
          break;
        case "http_proxy":
          this.title = "Edit: HTTP Proxy";
          break;
        case "console":
          this.title = "Edit: Console Viewer";
          break;
        case "migration":
          this.title = "Edit: Migration Settings";
          break;
        case "ha":
          this.title = "Edit: HA Settings";
          break;
        case "email_from":
          this.title = "Edit: Email From Address";
          break;
        case "mac_prefix":
          this.title = "Edit: MAC Address Prefix";
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
