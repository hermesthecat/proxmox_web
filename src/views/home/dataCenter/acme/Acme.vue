<template>
  <div style="padding: 20px">
    <overview-card>
      <div slot="title">Account</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showStatus }"
        class="m-tool-img"
        @click.stop="handleCollpise('status')"
      ></div>
      <div slot="content" class="card-content" v-if="showStatus">
        <div class="card-item">
          <page-template>
            <div slot="toolbar-left">
              <m-button
                type="primary"
                @on-click="showModal('create')"
                icon="el-icon-plus"
                >Add</m-button
              >
              <m-button
                type="info"
                @on-click="showModal('edit')"
                icon="el-icon-view"
                :disabled="selectedList.length !== 1"
                >View</m-button
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
                :data="db.acmeAccountList"
                ref="dataTable"
                @selection-change="handleSelect"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="Name" prop="name"></el-table-column>
              </el-table>
            </div>
          </page-template>
        </div>
      </div>
    </overview-card>
    <overview-card>
      <div slot="title">Challenge Plugins</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showResource }"
        class="m-tool-img"
        @click.stop="handleCollpise('resource')"
      ></div>
      <div slot="content" class="card-content" v-if="showResource">
        <div class="card-item">
          <page-template>
            <div slot="toolbar-left">
              <m-button
                type="primary"
                @on-click="showPlginModal('create')"
                icon="el-icon-plus"
                >Add</m-button
              >
              <m-button
                type="info"
                @on-click="showPlginModal('edit')"
                icon="el-icon-edit"
                :disabled="selectedPluginList.length !== 1"
                >Edit</m-button
              >
              <m-button
                type="danger"
                v-confirm="{
                  msg: 'Are you sure you want to delete the selected items?',
                  ok: () => handlePluginDelete(),
                  icon: 'icon-question',
                }"
                icon="el-icon-delete"
                :disabled="selectedPluginList.length <= 0"
                >Delete</m-button
              >
            </div>
            <div slot="page-content">
              <el-table
                :data="acmePluginList"
                ref="dataTable"
                @selection-change="handlePluginSelect"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="Plugin" prop="plugin"></el-table-column>
                <el-table-column label="API" prop="api"></el-table-column>
              </el-table>
            </div>
          </page-template>
          <create-acme-account-modal
            :title="title"
            :isCreate="isCreate"
            :param="param"
            :visible="visible"
            v-if="visible"
            :modal-type="type"
            @close="
              visible = false;
              queryAcmeAccountList();
            "
          ></create-acme-account-modal>
          <create-acme-plugin-modal
            :title="pluginTitle"
            :isCreate="pluginIsCreate"
            :param="pluginParam"
            :visible="pluginVisible"
            v-if="pluginVisible"
            :modal-type="pluginType"
            @close="
              pluginVisible = false;
              __init__();
            "
          ></create-acme-plugin-modal>

          <m-dialog
            :visible="showLog"
            @close="closeLog"
            :_style="{
              width: '800px',
            }"
            title="Task Viewer: Task Progress"
          >
            <template slot="content">
              <m-tab v-model="tab" @tab-click="handleTabChange">
                <m-tab-panel label="Output" name="log"></m-tab-panel>
                <m-tab-panel label="Status" name="status"></m-tab-panel>
              </m-tab>
              <m-button
                class="create-btn m-margin-top-10"
                type="primary"
                @on-click="stopTask1"
                :disabled="db.addClusterStatusObj.status !== 'running'"
                >Stop</m-button
              >
              <el-scrollbar style="height: 100%">
                <div class="taskmodal-content">
                  <div class="table" v-if="tab === 'log'">
                    <div
                      class="table-tr"
                      v-for="item in db.addClusterLogList"
                      :key="item.n"
                    >
                      {{ item.t }}
                    </div>
                  </div>
                  <div class="table" v-if="tab === 'status'">
                    <template v-for="(item, key) in db.addClusterStatusObj">
                      <div
                        class="table-tr"
                        v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                        :key="key"
                      >
                        <div class="table-td">
                          {{ $t(`clusterStatus.${key}`) }}
                        </div>
                        <div class="table-td" v-if="key === 'starttime'">
                          {{
                            dateFormat(
                              new Date(item * 1000),
                              "yyyy-MM-dd hh:mm"
                            )
                          }}
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
      </div>
    </overview-card>
  </div>
</template>
<script>
import OverviewCard from "@src/components/card/OverviewCard";
import AcmeHttp from "@src/views/home/dataCenter/acme/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateAcmeAccountModal from "./CreateAcmeAccountModal";
import CreateAcmePluginModal from "./CreateAcmePluginModal";
import { dateFormat } from "@libs/utils/index";
export default {
  name: "Acme",
  mixins: [AcmeHttp],
  components: {
    PageTemplate,
    OverviewCard,
    MButton,
    CreateAcmeAccountModal,
    CreateAcmePluginModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      showStatus: true,
      showResource: true,
      resourceList: [],
      selectedPluginList: [],
      pluginType: "create",
      pluginVisible: false,
      pluginTitle: "Create: Copy Job",
      pluginIsCreate: true,
      pluginParam: {},
      acmePluginList: [],
      showLog: false,
      interVal: null,
      tab: "log",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    // Initialize search
    __init__() {
      return Promise.all([
        this.queryAcmePluginsList().then(() => {
          this.acmePluginList = this.db.acmePluginList.filter(
            (it) => it.type !== "standalone"
          );
        }),
        this.queryAcmeAccountList(),
      ]);
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Register Account" : "View Account";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    // Check if button is clickable
    inStatus() {
      return this.selectedList.length <= 0;
    },
    // Table multi-select
    handleSelect(row) {
      this.selectedList = row;
    },
    // Plugin table multi-select
    handlePluginSelect(row) {
      this.selectedPluginList = row;
    },
    /**
     * Delete plugin
     */
    handlePluginDelete() {
      this.deleteAcmePlugin().catch((res) => {
        this.$confirm.confirm({
          msg: res,
          type: "info",
        });
      });
    },
    /**
     * Delete account
     */
    handleDelete() {
      this.deleteAcmeAccount()
        .then((res) => {
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
        })
        .catch((res) => {
          this.$confirm.confirm({
            msg: res,
            type: "info",
          });
        });
    },
    /**
     * Show/hide table
     */
    handleCollpise(type) {
      if (type === "status") {
        this.showStatus = !this.showStatus;
      } else {
        this.showResource = !this.showResource;
      }
    },
    /**
     * Show plugin modal
     */
    showPlginModal(type) {
      this.pluginType = type;
      this.pluginIsCreate = type === "create";
      this.pluginTitle =
        type === "create" ? "Create: ACME DNS Plugin" : "Edit: ACME DNS Plugin";
      this.pluginParam = type === "create" ? {} : this.selectedPluginList[0];
      this.pluginVisible = true;
    },
    /**
     * Stop running task
     */
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    /**
     * Close log dialog
     */
    closeLog() {
      this.showLog = false;
      this.__init__();
    },
    /**
     * Switch tab
     */
    handleTabChange(value) {
      this.tab = value;
    },
  },
  beforeDestroy() {
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
.card {
  width: 100%;
}
.m-tool-img {
  background-image: url("~@images/tool-sprites.png");
  overflow: hidden;
  width: 16px;
  height: 16px;
  margin: 0;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
  opacity: 0.8;
  background-position-y: -224px;
  display: inline-block;
  transition: transform 0.5s linear;
}
.m-tool-collpise {
  transform: rotate(180deg);
  transition: transform 0.5s linear;
}
/deep/.card {
  min-height: auto !important;
}
/deep/.page-template__content {
  height: auto !important;
}
</style>
