<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">Add</m-button>
      <m-button type="danger" @on-click="handleDelete" icon="el-icon-delete"
        :disabled="selectedList.length <= 0">Delete</m-button>
      <m-button type="info" icon="el-icon-edit" :disabled="selectedList.length !== 1"
        @on-click="showModal('edit')">Edit</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="fireWallAliasList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Name" prop="name"></el-table-column>
        <el-table-column label="IP/CIDR" prop="cidr"></el-table-column>
        <el-table-column label="Comment" prop="comment"></el-table-column>
      </el-table>
      <create-wall-alias-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modal-type="type" @close="
          visible = false;
        __init__();
        "></create-wall-alias-modal>
    </div>
  </page-template>
</template>
<script>
import QemuFireWallHttp from "@src/views/home/qemu/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateWallAliasModal from "./CreateWallAliasModal";
import { quickSort } from "@libs/utils/index";
export default {
  name: "FireWallAlias",
  mixins: [QemuFireWallHttp],
  components: {
    PageTemplate,
    MButton,
    CreateWallAliasModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Add: Alias",
      selectedList: [],
      isCreate: true,
      param: {},
      isGroup: false,
      fireWallAliasList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    __init__() {
      this.queryFireWallAlias().then((res) => {
        this.fireWallAliasList = quickSort(
          this.db.fireWallAliasList,
          "name",
          "+"
        );
      });
    },
    //Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Add: Alias" : "Edit: Alias";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
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
          this.deleteFireWallAlias();
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
