<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" icon="el-icon-plus" @on-click="showModal('create')">Create</m-button>
      <m-button type="info" @on-click="showModal('edit')" icon="el-icon-edit" :disabled="selectedList.length !== 1 ||
        (selectedList[0] && selectedList[0].special === 1)
        ">Edit</m-button>
      <m-button type="danger" v-confirm="{
        msg: `Are you sure you want to delete the selected items?`,
        ok: () => handleDelete(),
      }" icon="el-icon-delete" :disabled="selectedList.length <= 0 || inSpecial()">Delete</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.rolesList" ref="dataTable" :row-key="setRowKeys" :expand-row-keys="expands"
        @expand-change="expandChange" @selection-change="handleSelect">
        <el-table-column type="expand">
          <template slot-scope="props">
            <div class="form">
              <label class="form-label">Privileges</label>
              <span class="form-item">{{
                props.row && props.row.privs && props.row.privs
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Built-in" prop="special">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.special && scope.row.special === 1 ? 'Yes' : 'No'
              " :state="scope.row.special && scope.row.special === 1
                  ? 'actived'
                  : 'unActived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Name" prop="roleid"></el-table-column>
        <el-table-column label="Privileges" prop="privs" show-overflow-tooltip></el-table-column>
      </el-table>
      <create-access-role-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modal-type="type" @close="
          visible = false;
        __init__();
        "></create-access-role-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessRoleModal from "./CreateAccessRoleModal";
export default {
  name: "Role",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateAccessRoleModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      expands: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryRoleList();
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: Role" : "Edit: Role";
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
    expandChange(row, expandedRows) {
      var that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.roleid);
        }
      } else {
        that.expands = [];
      }
    },
    setRowKeys(row) {
      return row.roleid;
    },
    handleDelete() {
      this.deleteRoleById();
    },
    handleCommand(command) {
      this.type = command;
      this.visible = true;
    },
    inSpecial() {
      return this.selectedList.every((item) => {
        return item.special === 1;
      });
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

.form {
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  align-content: center;
  width: 100%;

  &-label {
    display: inline-block;
    vertical-align: middle;
    width: 10%;
  }

  &-item {
    display: inline-block;
    vertical-align: middle;
    word-break: break-all;
  }
}
</style>
