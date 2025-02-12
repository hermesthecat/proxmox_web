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
          v-for="item in options"
          :key="item.value"
          :id="item.value"
          :class="{ 'single-selected': option === item.value }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                :value="item.value"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">{{ item.label }}</div>
          <div
            class="table-td"
            v-if="
              [
                'enable',
                'ndp',
                'dhcp',
                'radv',
                'macfilter',
                'ipfilter',
              ].includes(item.value)
            "
          >
            {{
              db.qemuFireWallOptionsObj &&
              db.qemuFireWallOptionsObj[item.value] == 1
                ? "Yes"
                : "No"
            }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal(item.value)"
            ></i>
          </div>
          <div class="table-td" v-else>
            {{
              db.qemuFireWallOptionsObj && db.qemuFireWallOptionsObj[item.value]
                ? db.qemuFireWallOptionsObj[item.value]
                : "Default"
            }}
            <i
              class="el-icon-edit edit-icon"
              @click="showModal(item.value)"
            ></i>
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
import QemuFirewallOptionHttp from "@src/views/home/qemu/firewall/options/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import OptionModal from "./OptionModal";
export default {
  name: "NodeFirewallOption",
  mixins: [QemuFirewallOptionHttp],
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
      options: [
        {
          value: "enable",
          label: "Firewall",
        },
        {
          value: "dhcp",
          label: "DHCP",
        },
        {
          value: "ndp",
          label: "NDP",
        },
        {
          value: "radv",
          label: "Router Advertisement",
        },
        {
          value: "macfilter",
          label: "MAC Filter",
        },
        {
          value: "ipfilter",
          label: "IP Filter",
        },
        {
          value: "log_level_in",
          label: "log_level_in",
        },
        {
          value: "log_level_out",
          label: "log_level_out",
        },
        {
          value: "policy_in",
          label: "Input Policy",
        },
        {
          value: "policy_out",
          label: "Output Policy",
        },
      ],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    __init__() {
      this.queryQemuOption();
    },
    //Click table row event
    handleClick(event) {
      this.option = event.target.parentElement.id;
    },
    showModal(key) {
      this.type = key;
      switch (key) {
        case "enable":
          this.title = "Edit: Firewall";
          break;
        case "dhcp":
          this.title = "Edit: DHCP";
          break;
        case "policy_in":
          this.title = "Edit: Input Policy";
          break;
        case "ndp":
          this.title = "Edit: NDP";
          break;
        case "plicy_out":
          this.title = "Edit: Output Policy";
          break;
        case "ipfilter":
          this.title = "Edit: IP Filter";
          break;
        case "log_level_in":
          this.title = "Edit: log_level_in";
          break;
        case "log_level_out":
          this.title = "Edit: log_level_out";
          break;
        case "macfilter":
          this.title = "Edit: MAC Filter";
          break;
        case "radv":
          this.title = "Edit: Router Advertisement";
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
