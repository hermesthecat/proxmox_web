<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" icon="el-icon-plus" @on-click="showModal('create')">Add</m-button>
      <m-button type="info" @on-click="showModal('edit')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="danger" v-confirm="{
        msg: `Are you sure you want to delete the selected items?`,
        ok: () => handleDelete(),
      }" icon="el-icon-delete" :disabled="selectedList.length <= 0">Delete</m-button>
      <m-button type="info" @on-click="showModal('permission')" icon="el-icon-view"
        :disabled="selectedList.length !== 1">Show permissions</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="records" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Username" prop="userid" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.userid.split("@")[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Token Name" prop="tokenid" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.userid.split("@")[1] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Valid Until" prop="expire" sortable>
          <template slot-scope="scope">
            <span>{{
              scope.row.expire
                ? dateFormat(
                  new Date(scope.row.expire * 1000),
                  "yyyy-MM-dd hh:mm:ss"
                )
                : "Never Expires"
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Comment" prop="comment" sortable></el-table-column>
        <el-table-column label="Privilege Separation">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.privsep ? 'Yes' : 'No'"
              :state="scope.row.privsep ? 'actived' : 'unActived'"></table-info-state>
          </template>
        </el-table-column>
      </el-table>
      <create-api-token-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modal-type="type" @close="
          visible = false;
        __init__();
        "></create-api-token-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { dateFormat } from "@libs/utils/index";
import CreateApiTokenModal from "./CreateApiTokenModal";
export default {
  name: "ApiToken",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateApiTokenModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      records: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    // Initialize search
    __init__() {
      this.records = [];
      this.queryUsersList({ full: 1, _dc: new Date().getTime() }).then(() => {
        this.db.usersList.forEach((user) => {
          user.tokens &&
            user.tokens.forEach((token) => {
              let r = {};
              r.id = user.userid + "!" + token.tokenid;
              r.userid = user.userid;
              r.tokenid = token.tokenid;
              r.comment = token.comment;
              r.expire = token.expire;
              r.privsep = token.privsep === 1;
              this.records.push(r);
            });
        });
      });
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title =
        type === "create"
          ? "Create: User"
          : type === "edit"
            ? "Edit: User"
            : type === "modifyPsw"
              ? "Modify: Password"
              : type === "tfa"
                ? "Two-Factor Authentication"
                : "Permissions";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    // Check if button is clickable
    inStatus() {
      return this.selectedList.length <= 0;
    },
    // Selection handler
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.deleteApiToken();
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
