<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">Add</m-button>
      <m-button type="warning" @on-click="showModal('copy')" icon="el-icon-copy-document" :disabled="inStatus() ||
        (selectedList && selectedList[0] && selectedList[0].type === 'group')
        ">Copy</m-button>
      <m-button type="primary" @on-click="showModal('rule')" icon="el-icon-folder-add" :disabled="inStatus()">Insert:
        Security Group</m-button>
      <m-button type="danger" @on-click="handleDelete" icon="el-icon-delete"
        :disabled="selectedList.length <= 0">Delete</m-button>
      <m-button type="info" icon="el-icon-edit" :disabled="selectedList.length !== 1"
        @on-click="showModal('edit')">Edit</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="qemuLxcFireWallRuleList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55" prop="pos"></el-table-column>
        <el-table-column width="55" prop="pos"></el-table-column>
        <el-table-column label="Enable" prop="enable">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.enable && scope.row.enable === 1 ? 'Yes' : 'No'
              " :state="scope.row.enable && scope.row.enable === 1
                  ? 'actived'
                  : 'unActived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Type" prop="type"></el-table-column>
        <el-table-column label="Action" prop="action"></el-table-column>
        <el-table-column label="Macro" prop="macro"> </el-table-column>
        <el-table-column label="Interface" prop="iface"></el-table-column>
        <el-table-column label="Source" prop="source"></el-table-column>
        <el-table-column label="Destination" prop="dest"></el-table-column>
        <el-table-column label="Protocol" prop="proto"></el-table-column>
        <el-table-column label="Destination Port" prop="dport"></el-table-column>
        <el-table-column label="Source Port" prop="sport"></el-table-column>
        <el-table-column label="Log Level" prop="log"></el-table-column>
        <el-table-column label="Comment" prop="comment"></el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <m-button type="info" :icon="scope.row.enable === 0
                ? 'el-icon-video-play'
                : 'el-icon-video-pause'
              " @on-click="handleEnable(scope.row)">{{ scope.row.enable === 0 ? "Enable" : "Disable" }}</m-button>
          </template>
        </el-table-column>
      </el-table>
      <create-firewall-Rule-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modal-type="type" :isGroup="isGroup" @close="
          visible = false;
        __init__();
        "></create-firewall-Rule-modal>
    </div>
  </page-template>
</template>
<script>
import QemuFireWallHttp from "@src/views/home/qemu/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateFirewallRuleModal from "./CreateFirewallRuleModal";
import { quickSort } from "@libs/utils/index";
export default {
  name: "Access",
  mixins: [QemuFireWallHttp],
  components: {
    PageTemplate,
    MButton,
    CreateFirewallRuleModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      isGroup: false,
      qemuLxcFireWallRuleList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    __init__() {
      this.queryFireWallList().then((res) => {
        this.qemuLxcFireWallRuleList = quickSort(
          this.db.qemuLxcFireWallRuleList,
          "pos",
          "+"
        );
      });
    },
    //Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title =
        type === "create"
          ? "Add: Rule"
          : type === "copy"
            ? "Copy: Rule"
            : type === "edit"
              ? "Edit: Rule"
              : "Add: Security Group";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
      debugger;
      this.isGroup =
        this.selectedList[0] && this.selectedList[0].type === "group";
    },
    //Check if button is clickable
    inStatus() {
      return this.selectedList.length !== 1;
    },
    //Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to delete selected items?`,
          type: "info",
        })
        .then(() => {
          this.deleteFireWallRule();
        })
        .catch(() => { });
    },
    handleCommand(command) {
      this.type = command;
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
</style>
