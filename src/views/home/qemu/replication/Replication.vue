<template>
  <page-template v-loading="loading" :element-loading-text="loadingText">
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="fa fa-retweet">Add</m-button>
      <m-button type="primary" @on-click="showModal('edit')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="danger" @on-click="handleDelete()" icon="el-icon-delete"
        :disabled="selectedList.length !== 1">Delete</m-button>
      <m-button type="info" @on-click="showModal('log')" icon="el-icon-date"
        :disabled="selectedList.length !== 1">Logs</m-button>
      <m-button type="info" @on-click="() => handleImmidiateSchedule()" icon="el-icon-video-play"
        :disabled="selectedList.length !== 1">Schedule Now</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="qemuReplicationList" ref="dataTable" @selection-change="handleSelect" @sort-change="handleSort">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Guest" prop="guest" sortable></el-table-column>
        <el-table-column label="Job" prop="jobnum" sortable></el-table-column>
        <el-table-column label="Target" prop="target" sortable></el-table-column>
        <el-table-column label="Status" prop="error" show-overflow-tooltip>
          <template slot-scope="scope">
            <table-info-state :content="scope.row.failCount === 0 || !scope.row.error
              ? 'OK'
              : scope.row.error
              " :state="scope.row.failCount === 0 || !scope.row.error
                ? 'actived'
                : 'dead'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Enabled" prop="disable">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.disable && scope.row.disable === 1 ? 'No' : 'Yes'
              " :state="scope.row.disable && scope.row.disable === 1
                ? 'unActived'
                : 'actived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Last Sync" prop="last_sync" sortable>
          <template slot-scope="scope">
            {{ renderSync(scope.row.last_sync, "last", scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="Duration" prop="duration">
          <template slot-scope="scope">
            {{ render_duration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="Next Sync" prop="next_sync" sortable>
          <template slot-scope="scope">
            {{ renderSync(scope.row.next_sync, "next", scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="Schedule" prop="schedule">
          <template slot-scope="scope">
            <span>{{ scope.row.schedule ? scope.row.schedule : "*/15" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Notes" prop="comment" sortable></el-table-column>
      </el-table>
      <replication-create-modal :visible="visible" v-if="visible" :title="title" :param="param" :isCreate="isCreate"
        :modalType="modalType" @close="
          visible = false;
        __init__();
        "></replication-create-modal>
    </div>
  </page-template>
</template>
<script>
import ReplicationHttp from "@src/views/home/qemu/replication/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import ReplicationCreateModal from "./ReplicationCreateModal";
import {
  dateFormat,
  byteToSize,
  quickSort,
  throttle,
  format_duration_short,
} from "@libs/utils/index";
import { gettext } from "@src/i18n/local_zhCN.js";
export default {
  name: "QemuBackUp",
  mixins: [ReplicationHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    ReplicationCreateModal,
  },
  data() {
    return {
      modalType: "backup",
      visible: false,
      title: "",
      selectedList: [],
      isCreate: true,
      param: {},
      search: "",
      storage: "",
      qemuReplicationList: [],
      interVal: null,
      loading: false,
      loadingText: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    byteToSize,
    throttle,
    //Initialize search
    async __init__() {
      let _this = this;
      await _this
        .queryQemuReplication({ guest: this.node.vmid })
        .then((res) => {
          _this.qemuReplicationList = quickSort(
            this.db.qemuReplicationList,
            "guest",
            "+"
          );
        });
      _this.interVal = setInterval(() => {
        _this.queryQemuReplication({ guest: this.node.vmid }).then((res) => {
          _this.qemuReplicationList = quickSort(
            this.db.qemuReplicationList,
            "guest",
            "+"
          );
          let isAllOK = this.db.qemuReplicationList.every((item) => {
            if (
              (String(item.fail_count) && item.fail_count === 0) ||
              item.error
            )
              return true;
            else return false;
          });
          console.log("=====" + isAllOK);
          if (isAllOK) {
            if (_this.interVal) {
              clearInterval(_this.interVal);
              _this.interVal = null;
            }
          }
        });
      }, 10000);
    },
    //Button click state
    inStatus() {
      return this.selectedList.length <= 0;
    },
    //Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    /**
     * Delete backup task
     */
    handleDelete() {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to delete ${this.selectedList[0].volid}?`,
          type: "info",
          icon: "icon-warning",
        })
        .then(() => {
          this.delete()
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.$confirm.confirm({
                msg: res,
              });
            });
        })
        .catch(() => { });
    },
    //Sort
    handleSort({ colume, prop, order }) {
      let _this = this;
      if (order !== null)
        _this.qemuReplicationList = quickSort(
          _this.db.qemuReplicationList,
          prop,
          order === "ascending" ? "+" : "-"
        );
    },
    /**
     * Modal
     */
    showModal(type) {
      this.modalType = type;
      this.param = type !== "create" ? this.selectedList[0] : {};
      this.isCreate = type === "create";
      this.setTitle(type);
      this.visible = true;
    },
    /**
     * Set title @param type 'backup', 'config', 'restore'
     */
    setTitle(type) {
      switch (type) {
        case "create":
          this.title = `Create: Replication Job`;
          break;
        case "edit":
          this.title = `Edit: Replication Job`;
          break;
        case "log":
          this.title = `View: Logs`;
          break;
      }
    },
    /**
     * Render sync
     */
    renderSync(value, type, record) {
      if (!value) {
        return "-";
      }
      if (type === "last") {
        if (record.data && record.data.pid && record.data.pid) {
          return gettext("syncing");
        }
      } else {
        let now = new Date(),
          next = new Date(value * 1000);
        if (next < now) {
          return gettext("pending");
        }
      }
      return dateFormat(new Date(value * 1000), "yyyy-MM-dd hh:mm:ss");
    },
    /**
     * Duration
     */
    render_duration(value) {
      if (value === undefined) {
        return "-";
      }
      return format_duration_short(value);
    },
  },
  beforeDestory() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
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

/deep/.run-error {
  background: #f3d6d7 !important;
  color: #fff !important;

  &:hover {
    color: #606266 !important;
  }
}
</style>
