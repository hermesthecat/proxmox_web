<template>
  <page-template v-loading="loading" :element-loading-text="loadingText">
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="el-icon-plus">Add</m-button>
      <m-button type="primary" @on-click="showModal('edit')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="danger" v-confirm="{
        msg: `Are you sure you want to delete the selected items?`,
        ok: () => handleDelete('keep'),
      }" icon="el-icon-delete" :disabled="inStatus()">Delete</m-button>
      <m-button type="danger" v-confirm="{
        msg: `Are you sure you want to force delete the selected items?`,
        ok: () => handleDelete('force'),
      }" icon="el-icon-delete" :disabled="inStatus()">Force Delete</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.dataCenterReplicationList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Guest" prop="guest"></el-table-column>
        <el-table-column label="Job" prop="jobnum"></el-table-column>
        <el-table-column label="Target" prop="target"></el-table-column>
        <el-table-column label="Enabled" prop="disable">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.disable && scope.row.disable === 1 ? 'No' : 'Yes'
              " :state="scope.row.disable && scope.row.disable === 1
                  ? 'dead'
                  : 'actived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Schedule" prop="schedule">
          <template slot-scope="scope">
            <span>{{ scope.row.schedule ? scope.row.schedule : "*/15" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Comment" prop="comment"></el-table-column>
      </el-table>
      <create-replication-modal :title="title" :isCreate="isCreate" :param="param" v-if="visible" :visible="visible"
        :modal-type="type" @close="
          visible = false;
        __init__();
        "></create-replication-modal>
    </div>
  </page-template>
</template>
<script>
import DataCenterReplicationHttp from "@src/views/home/dataCenter/replication/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateReplicationModal from "./CreateReplicationModal";
export default {
  name: "Replication",
  mixins: [DataCenterReplicationHttp],
  components: {
    PageTemplate,
    MButton,
    CreateReplicationModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      loading: false,
      loadingText: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryReplicationList();
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
    // Delete replication
    handleDelete(type) {
      this.delete(type);
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
