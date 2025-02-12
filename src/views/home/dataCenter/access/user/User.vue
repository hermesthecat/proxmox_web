<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" icon="el-icon-plus" @on-click="showModal('create')">Add</m-button>
      <m-button type="info" @on-click="showModal('edit')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="info" @on-click="showModal('modifyPsw')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Change Password</m-button>
      <m-button type="danger" v-confirm="{
        msg: `Are you sure you want to delete the selected items?`,
        ok: () => handleDelete(),
      }" icon="el-icon-delete" :disabled="selectedList.length <= 0">Delete</m-button>
      <m-button type="info" @on-click="showModal('tfa')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">TFA</m-button>
      <m-button type="info" @on-click="showModal('permission')" icon="el-icon-view"
        :disabled="selectedList.length !== 1">Permissions</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.usersList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="User Name" prop="userid" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.userid.split("@")[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Domain" prop="userid" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.userid.split("@")[1] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Enabled" prop="enable" sortable>
          <template slot-scope="scope">
            <table-info-state 
              :content="scope.row.enable && scope.row.enable === 1 ? 'Yes' : 'No'"
              :state="scope.row.enable && scope.row.enable === 1 ? 'actived' : 'unActived'">
            </table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Expire Date" prop="expire" sortable>
          <template slot-scope="scope">
            <span>{{
              scope.row.expire
                ? dateFormat(
                  new Date(scope.row.expire * 1000),
                  "yyyy-MM-dd hh:mm:ss"
                )
                : "Never Expire"
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Name" prop="firstname" sortable>
          <template slot-scope="scope">
            <span>{{
              `${scope.row.firstname ? scope.row.firstname : ""} ${scope.row.lastname ? scope.row.lastname : ""
              }`
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="TFA">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.tfa ? 'Yes' : 'No'"
              :state="scope.row.tfa ? 'actived' : 'unActived'"></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Comment" prop="comment" sortable></el-table-column>
      </el-table>
      <create-user-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modal-type="type" @close="
          visible = false;
        __init__();
        "></create-user-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { dateFormat } from "@libs/utils/index";
import CreateUserModal from "./CreateUserModal";
export default {
  name: "Access",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateUserModal,
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
    dateFormat,
    //Initialize search
    __init__() {
      this.queryUsersList();
    },
    //Whether to show modal
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title =
        type === "create"
          ? "Create: User"
          : type === "edit"
            ? "Edit: User"
            : type === "modifyPsw"
              ? "Change: Password"
              : type === "tfa"
                ? "Two-Factor Authentication"
                : "Permissions";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    //Whether button is clickable
    inStatus() {
      return this.selectedList.length <= 0;
    },
    //Select
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.deleteUsers();
    },
    handelEditTfa() { },
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
