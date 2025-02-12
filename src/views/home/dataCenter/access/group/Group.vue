<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        icon="el-icon-plus"
        @on-click="showModal('create')"
        >Create</m-button
      >
      <m-button
        type="info"
        @on-click="showModal('edit')"
        icon="el-icon-edit"
        :disabled="selectedList.length !== 1"
        >Edit</m-button
      >
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
        :data="db.groupsList"
        ref="dataTable"
        @selection-change="handleSelect"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Name" prop="groupid"></el-table-column>
        <el-table-column label="Comment" prop="comnent"></el-table-column>
        <el-table-column label="Users" prop="users"></el-table-column>
      </el-table>
      <create-access-group-modal
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
      ></create-access-group-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAccessGroupModal from "./CreateAccessGroupModal";
export default {
  name: "Access",
  mixins: [DataCenterAccessHttp],
  components: {
    PageTemplate,
    MButton,
    CreateAccessGroupModal,
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
      this.queryGroupsList();
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: Group" : "Edit: Group";
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
    handleDelete() {
      this.deleteGroupById();
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
