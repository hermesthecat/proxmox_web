<template>
  <div class="ceph-fs">
    <div class="ceph-fs__top">
      <page-template>
        <div slot="toolbar-left">
          <m-button type="primary" :disabled="cephFsList.length > 0 && cephFsList.length !== 1"
            @on-click="showModal('cephfs')">Create CephFs</m-button>
        </div>
        <div slot="page-content">
          <el-table :data="cephFsList">
            <el-table-column label="Name" prop="name"></el-table-column>
            <el-table-column label="Data Pool" prop="data_pool"></el-table-column>
            <el-table-column label="MetaData Pool" prop="metadata_pool"></el-table-column>
          </el-table>
        </div>
      </page-template>
    </div>
    <div class="ceph-fs__bottom">
      <h1 class="ceph-fs__metadata">Metadata Servers</h1>
      <page-template>
        <div slot="toolbar-left">
          <m-button icon="fa fa-play" type="primary" :disabled="selectedList.length !== 1 || !inState('stopped', 'unknown')
            " @on-click="handleOperate('start')">Start</m-button>
          <m-button icon="fa fa-stop" type="danger" :disabled="selectedList.length !== 1"
            @on-click="handleOperate('stop')">Stop</m-button>
          <m-button icon="fa fa-refresh" type="primary" :disabled="selectedList.length !== 1"
            @on-click="handleOperate('restart')">Restart</m-button>
          <m-button icon="el-icon-plus" type="primary" @on-click="showModal('metadata')">Create</m-button>
          <m-button icon="el-icon-delete" type="danger" :disabled="selectedList.length !== 1"
            @on-click="handleOperate('delete')">Destroy</m-button>
          <m-button icon="el-icon-document" type="info" :disabled="selectedList.length !== 1"
            @on-click="showModal('log')">System Log</m-button>
          <m-button icon="el-icon-refresh" type="info" @on-click="__init__()">Refresh</m-button>
        </div>
        <div slot="page-content">
          <el-table :data="mdsList" @selection-change="(row) => (selectedList = row)">
            <el-table-column type="selection" width="55px"></el-table-column>
            <el-table-column label="Name" prop="name"></el-table-column>
            <el-table-column label="Host" prop="host"></el-table-column>
            <el-table-column label="Address" prop="addr"></el-table-column>
            <el-table-column label="Status" prop="state"></el-table-column>
            <el-table-column label="Version" prop="ceph_version_short"></el-table-column>
          </el-table>
        </div>
      </page-template>
    </div>
    <create-cephfs :visible="visible" v-if="visible" @close="visible = false" :title="title" :param="param"
      :modalType="modalType"></create-cephfs>
    <m-dialog :visible="showLog" @close="closeLog" :_style="{
      width: '800px',
    }" title="Task Viewer: Task Progress">
      <template slot="content">
        <m-tab v-model="tab" @tab-click="handleTabChange">
          <m-tab-panel label="Output" name="log"></m-tab-panel>
          <m-tab-panel label="Status" name="status"></m-tab-panel>
        </m-tab>
        <m-button class="create-btn m-margin-top-10" type="primary" @on-click="stopTask1"
          :disabled="db.addClusterStatusObj.status !== 'running'">Stop</m-button>
        <el-scrollbar style="height: 100%">
          <div class="taskmodal-content">
            <div class="table" v-if="tab === 'log'">
              <div class="table-tr" v-for="item in db.addClusterLogList" :key="item.n">
                {{ item.t }}
              </div>
            </div>
            <div class="table" v-if="tab === 'status'">
              <template v-for="(item, key) in db.addClusterStatusObj">
                <div class="table-tr" v-if="!['exitstatus', 'id', 'pstart'].includes(key)" :key="key">
                  <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                  <div class="table-td" v-if="key === 'starttime'">
                    {{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
                  </div>
                  <div class="table-td" v-else>{{ item }}</div>
                </div>
              </template>
            </div>
          </div>
        </el-scrollbar>
      </template>
      <template slot="footer">
        <span></span>
      </template>
    </m-dialog>
  </div>
</template>

<script>
import PageTemplate from "@src/components/page/PageTemplate.vue";
import CreateCephfs from "./createCephfs";
import CephHttp from "@src/views/home/node/ceph/http";
import { dateFormat } from "@libs/utils/index";
export default {
  name: "CephFs",
  mixins: [CephHttp],
  components: {
    PageTemplate,
    CreateCephfs,
  },
  data() {
    return {
      selectedList: [],
      visible: false,
      title: "",
      cephFsList: [],
      mdsList: [],
      modalType: "",
      showLog: false,
      tab: "log",
      interVal: null,
      param: {},
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    // Initialize request
    __init__() {
      // Request fs
      this.queryFs().then((res) => {
        this.cephFsList = res;
      });
      // Request mds
      this.queryMds().then((res) => {
        this.mdsList = res;
      });
    },
    closeLog() {
      this.showLog = false;
      this.__init__();
    },
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    handleTabChange(value) {
      this.tab = value;
    },
    showModal(type) {
      this.modalType = type;
      this.title =
        type === "metadata"
          ? "Create Metadata Server"
          : type === "log"
            ? "System Log"
            : "Create CephFs";
      this.param = this.selectedList[0];
      this.visible = true;
    },
    // Delete, restart, stop operations
    handleOperate(operate) {
      this.$confirm
        .confirm({
          msg: "Are you sure you want to perform this operation?",
          icon: "icon-warning",
        })
        .then((res) => {
          let selectedList = this.selectedList[0];
          if (operate !== "delete") {
            this.operateCeph(selectedList.host, operate).then((res) => {
              this.showLog = true;
              this.interVal = setInterval(() => {
                this.queryStatus(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
                this.queryLog(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
              }, 3000);
            });
          } else {
            // Delete mds
            this.deleteMds(selectedList.name).then((res) => {
              this.showLog = true;
              this.interVal = setInterval(() => {
                this.queryStatus(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
                this.queryLog(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
              }, 3000);
            });
          }
        });
    },
    // Check if in certain state
    inState() {
      let states = [],
        _this = this;
      for (let i = 0; i < arguments.length; i++) {
        states.push(arguments[i]);
      }
      return states.some((state) => {
        return state === _this.selectedList[0].state;
      });
    },
  },
  // Destroy timer before instance is destroyed
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
};
</script>

<style lang="less" scoped>
/deep/.page-template__content {
  height: auto !important;
  min-height: auto !important;
}

.ceph-fs__metadata {
  font-size: 16px;
  margin: 0px 20px;
  padding: 10px 10px;
  background: #c4d6ec;
  color: #fff;
}
</style>
