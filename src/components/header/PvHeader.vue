<template>
  <div class="header-container">
    <div class="header-container-left">
      <div class="pve-logo"></div>
      <div class="pve-search">
        <label class="inline-block">Virtual Environment 6.0-4</label>
        <span class="inline-block">
          <m-input
            placeholder="Search"
            v-model="searchModel"
            ref="search-input"
            @blur="handleBlur"
            @focus="searchModelFocus"
          />
          <div
            class="pve-search-resource-table"
            tabindex="-1"
            v-show="showSearchTable"
            ref="searchRef"
          >
            <el-table
              :data="searchTable"
              highlight-current-row
              @row-click="handelRowClick"
            >
              <el-table-column prop="type" label="Category" width="120">
                <template slot-scope="scope">
                  <span>
                    <i
                      class="fa"
                      style="width: 15px"
                      :class="{
                        'fa-tags': scope.row.type === 'pool',
                        'fa-desktop':
                          scope.row.type === 'qemu' &&
                          !isTemplate(scope.row.template),
                        'fa-file-o qemu':
                          scope.row.type === 'qemu' &&
                          isTemplate(scope.row.template),
                        'fa-database': scope.row.type === 'storage',
                        'fa-building': scope.row.type === 'node',
                        'fa-cube':
                          scope.row.type === 'lxc' &&
                          !isTemplate(scope.row.template),
                        'fa-file-o lxc':
                          scope.row.type === 'lxc' &&
                          isTemplate(scope.row.template),
                      }"
                    ></i>
                    <span
                      class="m-icon-custom fa"
                      style="left: -10px; top: -1px"
                      :class="setStautsCls(scope.row, scope.row.type)"
                    ></span>
                    <span>{{ scope.row.type }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Description" width="120">
                <template slot-scope="scope">
                  <span v-if="scope.row.type === 'pool'">pools</span>
                  <span
                    v-if="scope.row.type === 'qemu' || scope.row.type === 'lxc'"
                    >{{
                      scope.row.vmid +
                      `${scope.row.name ? "(" + scope.row.name + ")" : ""}`
                    }}</span
                  >
                  <span v-if="scope.row.type === 'storage'">{{
                    scope.row.storage
                  }}</span>
                  <span v-if="scope.row.type === 'node'">{{
                    scope.row.node
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="node" label="Node" width="120">
              </el-table-column>
              <el-table-column prop="pool" label="Resource Pool" width="120">
              </el-table-column>
            </el-table>
          </div>
        </span>
      </div>
    </div>
    <template v-show="showCreateVm">
      <CreateQemuModal
        :showCreateVm="showCreateVm"
        v-if="showCreateVm"
        @close="showCreateVm = false"
      ></CreateQemuModal>
    </template>
    <template v-show="visibleLxc">
      <CreateLxcModal
        :visible="visibleLxc"
        v-if="visibleLxc"
        @close="visibleLxc = false"
      ></CreateLxcModal>
    </template>
    <div class="header-container-right">
      <ul class="header-container-content">
        <a
          class="header-container-content-item"
          target="_blank"
          href="/pve-docs/index.html"
          ><i class="fa fa-book"></i>Documentation</a
        >
        <li class="header-container-content-item" @click="showCreateVm = true">
          <i class="fa fa-desktop"></i>Create VM
        </li>
        <li
          class="header-container-content-item"
          @click="() => (visibleLxc = true)"
        >
          <i class="fa fa-cube"></i>Create CT
        </li>
        <li
          class="header-container-content-item"
          style="padding: 0 10px"
          @click="() => (visible = true)"
        >
          <i class="fa fa-list"></i><span>Logs</span>
        </li>
        <li
          class="header-container-content-item"
          style="background: #409eff; color: #fff"
        >
          <Dropdown
            trigger="click"
            icon="fa fa-user"
            @on-change="handleCommand"
            style="padding: 0px 10px; border: none"
          >
            <span slot="label">{{ userid }}</span>
            <DropdownItem icon="fa fa-fw fa-key" command="psw"
              >Password</DropdownItem
            >
            <DropdownItem icon="fa fa-fw fa-lock" command="TFA"
              >TFA</DropdownItem
            >
            <DropdownItem icon="fa fa-fw fa-sign-out" command="layout"
              >Logout</DropdownItem
            >
          </Dropdown>
        </li>
      </ul>
    </div>
    <log-list
      :visible="visible"
      v-if="visible"
      @close="visible = false"
    ></log-list>
    <modify-psw-modal
      :visible="visiblePsw"
      v-if="visiblePsw"
      @close="visiblePsw = false"
    ></modify-psw-modal>
    <create-user-modal
      :title="title"
      :isCreate="isCreate"
      :param="param"
      :visible="visibleTfa"
      v-if="visibleTfa"
      :modal-type="type"
      @close="visibleTfa = false"
    ></create-user-modal>
  </div>
</template>

<script>
import { stopEvent, quickSort } from "@libs/utils";
import VuexMixins from "@src/mixins/VuexMixins";
import Dropdown from "@src/components/dropdown/dropdown";
import DropdownItem from "@src/components/dropdown/dropdownItem";
import CreateQemuModal from "./CreateQemuModal";
import CreateLxcModal from "./CreateLxcModal";
import BaseIcon from "../icon/BaseIcon.vue";
import LogList from "./LogList";
import ModifyPswModal from "./ModifyPswModal";
import MInput from "../input/mInput.vue";
import CreateUserModal from "@src/views/home/dataCenter/access/user/CreateUserModal";

export default {
  name: "PvHeader",
  mixins: [VuexMixins],
  components: {
    Dropdown,
    DropdownItem,
    CreateQemuModal,
    BaseIcon,
    LogList,
    CreateLxcModal,
    ModifyPswModal,
    MInput,
    CreateUserModal,
  },
  data() {
    return {
      showSearchTable: false,
      searchModel: "",
      showCreateVm: false,
      visible: false,
      visibleLxc: false,
      visiblePsw: false, // Whether to show password modification page
      userid: "",
      title: "",
      isCreate: false,
      type: "",
      param: {},
      visibleTfa: false,
    };
  },
  computed: {
    /**
     * Filter resource data and sort by type in ascending order
     */
    searchTable() {
      let _this = this;
      let datas = _this.$store.state.db.resources.filter((item) => {
        if (
          _this.searchModel &&
          JSON.stringify(item).indexOf(_this.searchModel) > -1
        ) {
          return item;
        } else if (_this.searchModel === "") {
          return item;
        }
      });
      return quickSort(datas, "type", "+");
    },
  },
  methods: {
    /**
     * Handle logout and password reset
     */
    handleCommand(command) {
      switch (command) {
        case "psw":
          this.visiblePsw = true;
          break;
        case "TFA":
          this.type = "tfa";
          this.isCreate = false;
          this.title = "Two-Factor Authentication";
          this.param = { userid: this.userid };
          this.visibleTfa = true;
          break;
        case "layout":
          this.$router.push("/login");
          break;
        default:
          return;
      }
    },
    __init__() {
      let ticket = window.localStorage.getItem("ticket") || "{}";
      this.userid = JSON.parse(ticket).username;
      console.log(this.userid);
      this.queryResource();
    },
    /**
     * Query resources
     */
    queryResource() {
      this.$http.get("/json/cluster/resources").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "resources",
            list: res.data,
          });
        }
      });
    },
    // Set status class
    setStautsCls(record, type) {
      let status = "";
      let objType = type;
      if (record.template && this.isTemplate(record.template)) {
        // Template
        objType = "template";
        status = type;
      } else {
        // Other records
        status = record.status
          ? record.status + " ha-" + record.hastate
          : " ha-" + record.hastate;
      }
      if (record.lock) {
        status += " locked lock-" + record.lock;
      }
      return status;
    },
    /**
     * Check if it's a template. If undefined or template is 0, it's not a template
     */
    isTemplate(tmpl) {
      if (tmpl && String(tmpl) !== "0") {
        return true;
      } else {
        return false;
      }
    },
    handelRowClick(row, columns, event) {
      this.updateSearchObj(row);
      this.showSearchTable = false;
    },
    /**
     * Focus
     */
    searchModelFocus(e) {
      this.showSearchTable = true;
    },
    /**
     * Hide search
     */
    handleBlur() {
      setTimeout(() => {
        this.showSearchTable = false;
      }, 500);
    },
  },
  mounted() {
    this.__init__();
  },
};
</script>

<style scoped lang="less">
@import "./pv-header.less";
/deep/.prefix-icon::after {
  color: #fff;
}
</style>
