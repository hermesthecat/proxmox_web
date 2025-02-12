<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="handleRefresh()" icon="el-icon-edit">Refresh</m-button>
      <m-dropdown trigger="click" @on-change="handleCommand" style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        ">
        <span slot="label">
          <m-button type="primary" style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="fa fa-refresh">Update</m-button>
        </span>
        <m-dropdown-item command="html5" name="novnc">NoVNC</m-dropdown-item>
        <m-dropdown-item command="vv" name="virt-viewer">SPICE</m-dropdown-item>
        <m-dropdown-item command="xtermjs" name="xtermjs">xtermjs</m-dropdown-item>
      </m-dropdown>
      <m-button type="warning" @on-click="showChangeLog()" icon="el-icon-video-play"
        :disabled="selectedList.length !== 1">Changelog</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.aptList" ref="dataTable" @selection-change="handleSelect"
        :default-sort="{ prop: 'Package', order: 'ascending' }">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Package" prop="Package" sortable></el-table-column>
        <el-table-column label="Version">
          <el-table-column prop="OldVersion" label="Current"></el-table-column>
          <el-table-column prop="Version" label="New"></el-table-column>
        </el-table-column>
        <el-table-column label="Description" prop="Description" sortable show-overflow-tooltip></el-table-column>
      </el-table>
      <Dialog :visible="showLog" @close="closeLog" @cancel="closeLog" :_style="{
        width: '800px',
      }" title="Changelog">
        <template slot="content" v-if="modalType === 'log'">
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
                      {{
                        dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm")
                      }}
                    </div>
                    <div class="table-td" v-else>{{ item }}</div>
                  </div>
                </template>
              </div>
            </div>
          </el-scrollbar>
        </template>
        <template slot="content" v-if="modalType === 'changeLog'">
          <ace-editor v-model="changeLogContent" ref="ace-editor"></ace-editor>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
    </div>
  </page-template>
</template>
<script>
import NodeAptUpdateHttp from "@src/views/home/node/apt-update/http";
import PageTemplate from "@src/components/page/PageTemplate";
import Dialog from "@src/components/dialog/Dialog";
import MButton from "@src/components/button/Button";
import { dateFormat, openConsoleWindow } from "@libs/utils/index";
import AceEditor from "@src/components/ace/AceEditor";
export default {
  name: "Replication",
  mixins: [NodeAptUpdateHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    AceEditor,
  },
  data() {
    return {
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      param: {},
      showLog: false,
      interVal: null,
      visible: false,
      isCreate: false,
      tab: "log",
      modalType: "",
      changeLogContent: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    // Initialize search
    __init__() {
      let _this = this;
      _this.queryAptUpdateList();
    },
    // Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    // Tab change event
    handleTabChange(tab) {
      this.tab = tab;
    },
    // Close log page
    closeLog() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.showLog = false;
      this.__init__();
    },
    // Stop task
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    // Choose creation method
    handleCommand(type) {
      let _this = this;
      openConsoleWindow(type, "upgrade", 0, _this.node, "", "");
    },
    // Update
    handleRefresh() {
      this.querySubscriptionInfo().then((res) => {
        this.$confirm
          .confirm({
            msg: this.db.subscriptionObj.message,
            icon: "icon-question",
          })
          .then((res) => {
            this.update().then((res) => {
              this.showLog = true;
              this.interVal = setInterval(() => {
                this.queryLog(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
                this.queryStatus(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                );
              }, 3000);
              this.modalType = "log";
            });
          });
      });
    },
    // Changelog
    showChangeLog() {
      let param = {
        _dc: new Date().getTime(),
        name: this.selectedList[0].Package,
        version: this.selectedList[0].Version,
      },
        _this = this;
      _this.showLog = true;
      this.queryChangeLog(param)
        .then((res) => {
          _this.changeLogContent = _this.db.changeLogObj.data;
          _this.modalType = "changeLog";
        })
        .catch((res) => {
          _this.$confirm.confirm({
            msg: res,
          });
        });
    },
  },
  // Destroy timer
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
};
</script>
