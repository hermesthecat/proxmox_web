<template>
  <page-template>
    <div slot="toolbar-left">
      <m-dropdown trigger="click" icon="fa fa-user" @on-change="handleCommand" style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        ">
        <span slot="label">
          <m-button type="primary" style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus">Add</m-button>
        </span>
        <m-dropdown-item icon="fa fa-users" command="group">Permission Group</m-dropdown-item>
        <m-dropdown-item icon="fa fa-user" command="user">User Permission</m-dropdown-item>
        <m-dropdown-item icon="fa fa-user-o" command="apiToken">API Token Permission</m-dropdown-item>
      </m-dropdown>
      <m-button type="danger" @on-click="handleDelete" icon="el-icon-delete"
        :disabled="selectedList.length <= 0">Delete</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="accessList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="User/Group/API Token" prop="ugid"></el-table-column>
        <el-table-column label="Role" prop="roleid"></el-table-column>
      </el-table>
      <create-access-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modal-type="type" @close="
          visible = false;
        __init__();
        "></create-access-modal>
    </div>
  </page-template>
</template>
<script>
import StorageAccessHttp from "@src/views/home/qemu/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessModal from "./CreateAccessModal";
export default {
  name: "StorageAccess",
  mixins: [StorageAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateAccessModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      accessList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    __init__() {
      let _this = this;
      _this.queryAccessList().then(() => {
        let last = window.localStorage.getItem("lastsel") || "[]",
          _last = JSON.parse(last);
        if (_last.type === "pool") {
          _this.accessList = _this.db.accessList.filter(
            (item) => item.path.indexOf(_last.pool) >= 0
          );
        } else {
          _this.accessList = _this.db.accessList.filter(
            (item) => item.path.indexOf(_this.vmid) >= 0
          );
        }
      });
    },
    //Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: Copy Job" : "Edit: Copy Job";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    //Check if button is clickable
    inStatus() {
      return this.selectedList.length <= 0;
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
          this.delete(type).then((res) => {
            this.__init__();
          });
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
