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
        <m-dropdown-item icon="fa fa-users" command="ad">Active Directory Server (AD)</m-dropdown-item>
        <m-dropdown-item icon="fa fa-user" command="ldap">LDAP Server</m-dropdown-item>
      </m-dropdown>
      <m-button type="info" @on-click="showModal('edit')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="danger" v-confirm="{
        msg: `Are you sure you want to delete the selected items?`,
        ok: () => handleDelete(),
      }" icon="el-icon-delete" :disabled="selectedList.length <= 0 || inTypes()">Delete</m-button>
      <m-button type="primary" icon="el-icon-plus" :disabled="selectedList.length <= 0 || inTypes()"
        @on-click="showModal('sync')">Sync</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.domainsList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Realm" prop="realm"></el-table-column>
        <el-table-column label="Type" prop="type"></el-table-column>
        <el-table-column label="TFA" prop="tfa"></el-table-column>
        <el-table-column label="Comment" prop="comment"></el-table-column>
      </el-table>
      <create-access-domain-modal :title="title" :isCreate="isCreate" :param="param" :visible="visible" v-if="visible"
        :modalType="modalType" :_type="type" @close="
          visible = false;
        __init__();
        "></create-access-domain-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessDomainModal from "./CreateDomainModal";
export default {
  name: "Access",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateAccessDomainModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      realmList: [],
      realm: "",
      modalType: "create",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryDomain();
    },
    // Show modal dialog
    showModal(type) {
      this.isCreate = type === "create";
      this.modalType = type;
      this.title = `Edit: ${this.selectedList[0].type === "ad"
          ? "Active Directory Server (AD)"
          : this.selectedList[0].type === "pam"
            ? "Linux PAM"
            : this.selectedList[0].type === "pve"
              ? "Proxmox VE authentication server"
              : "LDAP Server"
        }`;
      this.param = this.selectedList[0];
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
    handleDelete() {
      this.deleteAccessDomainById();
    },
    handleCommand(command) {
      this.type = command;
      this.isCreate = true;
      this.modalType = "create";
      if (this.isCreate)
        this.title =
          command === "ad" ? `Add: Active Directory Server (AD)` : `Add: LDAP Server`;
      this.visible = true;
    },
    inTypes() {
      return this.selectedList.some((it) => ["pve", "pam"].includes(it.type));
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
