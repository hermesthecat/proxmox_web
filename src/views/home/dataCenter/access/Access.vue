<template>
  <page-template>
    <div slot="toolbar-left">
      <m-dropdown
        trigger="click"
        icon="fa fa-user"
        @on-change="handleCommand"
        style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        "
      >
        <span slot="label">
          <m-button
            type="primary"
            style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus"
            >Add</m-button
          >
        </span>
        <m-dropdown-item icon="fa fa-users" command="group"
          >Permission Group</m-dropdown-item
        >
        <m-dropdown-item icon="fa fa-user" command="user"
          >User Permission</m-dropdown-item
        >
        <m-dropdown-item icon="fa fa-user-o" command="apiToken"
          >Api Token Permission</m-dropdown-item
        >
      </m-dropdown>
      <m-button
        type="danger"
        v-confirm="{
          msg: `Are you sure you want to delete the selected items?`,
          ok: () => handleDelete(),
        }"
        icon="el-icon-delete"
        :disabled="selectedList.length <= 0"
        >Delete</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.accessList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Path" prop="path"></el-table-column>
        <el-table-column
          label="User/Group/API Token"
          prop="ugid"
        ></el-table-column>
        <el-table-column label="Role" prop="roleid"></el-table-column>
        <el-table-column label="Propagate" prop="propagate">
          <template slot-scope="scope">
            <table-info-state
              :content="
                scope.row.propagate && scope.row.propagate === 1 ? 'Yes' : 'No'
              "
              :state="
                scope.row.propagate && scope.row.propagate === 1
                  ? 'actived'
                  : 'unActived'
              "
            ></table-info-state>
          </template>
        </el-table-column>
      </el-table>
      <create-access-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="
          visible = false;
          __init__();
        "
      ></create-access-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessModal from "./CreateAccessModal";
export default {
  name: "Access",
  mixins: [DataCenterAccessHttp],
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
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryAccessList();
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: Copy Job" : "Edit: Copy Job";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    // Check if button is clickable
    inStatus() {
      return this.selectedList.length <= 0;
    },
    // Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.delete(type);
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
