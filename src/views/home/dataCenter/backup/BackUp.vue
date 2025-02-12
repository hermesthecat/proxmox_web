<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" icon="el-icon-plus" @on-click="showModal('create')">Add</m-button>
      <m-button type="danger" icon="el-icon-delete" v-confirm="{
        msg: `Are you sure you want to delete the selected items?`,
        ok: () => deleteBackUp(),
      }" :disabled="selectedList.length <= 0">Delete</m-button>
      <m-button type="primary" icon="el-icon-edit" @on-click="showModal('edit')"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="info" icon="el-icon-video-play" v-confirm="{
        msg: `Are you sure you want to start the selected backup job?`,
        ok: () => runNow(),
      }" :disabled="selectedList.length <= 0">Run Now</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.backUpList" ref="dataTable" @selection-change="handleSelect">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Node" prop="node"></el-table-column>
        <el-table-column label="Day of Week" prop="dow">
          <template slot-scope="scope">
            {{ setDay(scope.row.dow) }}
          </template>
        </el-table-column>
        <el-table-column label="Start Time" prop="starttime"></el-table-column>
        <el-table-column label="Enabled" prop="enabled">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.enabled && scope.row.enabled === '1' ? 'Yes' : 'No'
              " :state="scope.row.enabled && scope.row.enabled === '1'
                  ? 'actived'
                  : 'unActived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Storage" prop="storage"></el-table-column>
        <el-table-column label="Selection" prop="vmid">
          <template slot-scope="scope">
            <span v-show="scope.row.exclude">All except {{ scope.row.exclude }}</span>
            <span v-show="scope.row.all && !scope.row.exclude">--All--</span>
            <span v-show="scope.row.vmid">{{ scope.row.vmid }}</span>
            <span v-show="scope.row.pool">Pool'{{ scope.row.pool }}'</span>
          </template>
        </el-table-column>
      </el-table>
      <CreateBackUpModal :visible="visible" @close="
        visible = false;
      __init__();
      " :param="editParam" v-if="visible" :type="type" :title="title"></CreateBackUpModal>
    </div>
  </page-template>
</template>
<script>
import CreateBackUpModal from "@src/views/home/dataCenter/backup/CreateBackUpModal";
import BackUpHttp from "@src/views/home/dataCenter/backup/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
export default {
  name: "Cluster",
  mixins: [BackUpHttp],
  components: {
    PageTemplate,
    MButton,
    CreateBackUpModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      selectedList: [],
      title: "",
      editParam: {},
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryBackUpList().then((res) => {
        //this.handelDefaultSel();
      });
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.title = type === "create" ? "Create Backup" : "Edit Backup";
      if (type !== "create") this.editParam = this.selectedList[0];
      this.visible = true;
    },
    // Check if button is clickable
    inStatus() {
      return this.db.clusterObj &&
        this.db.clusterObj.totem &&
        this.db.clusterObj.totem.cluster_name
        ? true
        : false;
    },
    handelDefaultSel() {
      this.db.backUpList.forEach((row) => {
        if (row.enabled)
          this.$refs.dataTable.toggleRowSelection(row, row.enabled === "1");
      });
    },
    setDay(day) {
      if (!day) return;
      let days = day.split(",");
      return days
        .map((item) => {
          return this.$t(`day.${item}`);
        })
        .join(",");
    },
    deleteBackUp() {
      this.delete();
    },
    // Selection
    handleSelect(rows) {
      this.selectedList = rows;
    },
    // Run now
    runNow() {
      this.run();
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
