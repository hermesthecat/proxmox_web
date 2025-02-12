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
        type="primary"
        icon="el-icon-edit"
        @on-click="showModal('edit')"
        :disabled="selectedList.length !== 1"
        >Edit</m-button
      >
      <m-button
        type="danger"
        v-confirm="{
          msg: 'Are you sure you want to delete the selected items?',
          ok: () => handleDelete(),
          icon: 'icon-question',
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
        <el-table-column label="Group" prop="group"></el-table-column>
        <el-table-column label="restricted" prop="restricted"></el-table-column>
        <el-table-column label="nofailback" prop="nofailback"></el-table-column>
        <el-table-column label="Node" prop="nodes"></el-table-column>
        <el-table-column label="Comment" prop="comment"></el-table-column>
      </el-table>
      <create-ha-group-modal
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
      ></create-ha-group-modal>
    </div>
  </page-template>
</template>
<script>
import HaHttp from "@src/views/home/dataCenter/ha/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateHaGroupModal from "./CreateHaGroupModal";
export default {
  name: "HaGroup",
  mixins: [HaHttp],
  components: {
    PageTemplate,
    MButton,
    CreateHaGroupModal,
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
      this.queryGroups();
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: HA Group" : "Edit: HA Group";
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
      this.deleteHaGroup();
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
