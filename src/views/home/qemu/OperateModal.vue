<template>
  <m-dialog :visible="visible" :title="title" @close="close" :_style="{
    width: '946px',
  }" @confirm="confirm">
    <template slot="content">
      <template v-if="modalType === 'migrate'">
        <div class="m-form__section">
          <dl>
            <dt></dt>
            <dd>
              <m-input label="Source node" :disabled="true" labelWidth="100px">
                <div slot="other" style="height: 28px; line-height: 28px; padding-left: 5px" class="disabled">
                  {{ qemu.node }}
                </div>
              </m-input>

              <m-select prop="nodename" label="Target Node" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.nodename.error" :error-msg="rules.nodename.message" required @on-change="(value) => {
                  nodename = value;
                  checkMigratePreconditions();
                }
                  " v-model="nodename" placeholder="Please Select Node">
                <m-option v-for="(item, index) in nodeList" :key="item.node" :label="item.node" :value="item.node">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Node</div>
                    <div class="table-td">Memory Usage</div>
                    <div class="table-td">CPU Usage</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.node">{{
                      item.node
                    }}</span>
                    <span class="table-td" :title="item.mem &&
                      item.maxmem &&
                      percentToFixed(item.mem / item.maxmem, 3)
                      ">{{
                        item.mem &&
                        item.maxmem &&
                        percentToFixed(item.mem / item.maxmem, 3)
                      }}</span>
                    <span class="table-td" :title="item.cpu &&
                      item.maxcpu &&
                      `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                      ">{{
                        item.cpu &&
                        item.maxcpu &&
                        `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                      }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-input label="Mode" :disabled="true" labelWidth="100px">
                <div slot="other" style="height: 28px; line-height: 28px; padding-left: 5px" class="disabled">
                  {{ setMode }}
                </div>
              </m-input>

              <m-select prop="storage" label="Target Storage" labelWidth="100px" :readonly="true"
                @on-change="(value) => (storage = value)" v-model="storage" placeholder="Please Select Storage"
                v-if="qemu.type === 'qemu'" v-show="running">
                <m-option v-for="(item, index) in storageList" :key="item.storage" :label="item.storage"
                  :value="item.storage">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Name</div>
                    <div class="table-td">Type</div>
                    <div class="table-td">Available</div>
                    <div class="table-td">Capacity</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.storage">{{
                      item.storage
                    }}</span>
                    <span class="table-td" :title="item.type">{{
                      item.type
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.avail)">{{
                      byteToSize(item.avail)
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.total)">{{
                      byteToSize(item.total)
                    }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-checkbox label="Force" v-model="migration.overwriteLocalResourceCheck"
                @change="checkMigratePreconditions(true)" v-show="!setLocalResourceCheckboxHidden"></m-checkbox>
            </dd>
            <dt></dt>
            <dd style="max-height: 200px; overflow: auto" v-show="migration.preconditions && migration.preconditions.length > 0
              ">
              <el-table :data="migration.preconditions">
                <el-table-column prop="severity" width="25px">
                  <template slot-scope="scope">
                    <i :class="[
                      'fa',
                      `fa-${scope.row.severity === 'error'
                        ? 'times error'
                        : 'exclamation-triangle warning'
                      }`,
                    ]"></i>
                  </template>
                </el-table-column>
                <el-table-column prop="text" label="info"></el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
      </template>

      <template v-if="modalType === 'clone'">
        <div class="m-form__section">
          <dl>
            <dd style="width: 100%">
              <m-select prop="nodename" label="Target Node" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.nodename.error" :error-msg="rules.nodename.message" required @on-change="(value) => {
                  nodename = value;
                  queryTargetStorage();
                }
                  " v-model="nodename" placeholder="Please Select Node">
                <m-option v-for="(item, index) in nodeList" :key="item.node" :label="item.node" :value="item.node">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Node</div>
                    <div class="table-td">Memory Usage</div>
                    <div class="table-td">CPU Usage</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.node">{{
                      item.node
                    }}</span>
                    <span class="table-td" :title="percentToFixed(item.mem / item.maxmem, 3)">{{ percentToFixed(item.mem
                      / item.maxmem, 3) }}</span>
                    <span class="table-td" :title="`${percentToFixed(item.cpu, 3)} of ${item.maxcpu
                      }`">{{
                        `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                      }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-select prop="clonemode" label="Clone Mode" labelWidth="100px" :readonly="true" @on-change="(value) => {
                clonemode = value;
                storage = '';
              }
                " v-model="clonemode" placeholder="Please Select Clone Mode">
                <m-option v-for="item in modeList" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <div v-if="!isTemplate && hasSnapshots" style="
                  margin: 0px 0px 10px 10px;
                  display: flex;
                  justify-content: space-between;
                ">
                <div>Snapshot</div>
                <div>
                  <m-input placeholder="Please Enter Snapshot Name" @input="debounce(searchSnapshot(), 1000)"
                    v-model="snaphot">
                    <i slot="prefix" class="el-icon-search"></i>
                  </m-input>
                </div>
              </div>
              <el-table v-if="!isTemplate && hasSnapshots" highlight-current-row @current-change="(value) => {
                if (value && value.name) {
                  snapshotname = value.name;
                }
              }
                " :show-error="rules['snapshotname'].error" :error-msg="rules['snapshotname'].message"
                :data="chunkData(snapdbshotList, pageSize)[currentPage - 1]" @sort-change="handleSort"
                style="width: 100%" max-height="250">
                <el-table-column width="55px;">
                  <template slot-scope="scope">
                    <el-radio :label="scope.row.name" v-model="snapshotname">&nbsp;</el-radio>
                  </template>
                </el-table-column>
                <el-table-column label="Snapshot" prop="name" width="300px"></el-table-column>
                <el-table-column label="Include Memory">
                  <template slot-scope="scope">
                    <table-info-state :state="scope.row.vmstate === 1 ? 'actived' : 'unActived'"
                      :content="scope.row.vmstate === 1 ? 'Yes' : 'No'"></table-info-state>
                  </template>
                </el-table-column>
                <el-table-column label="Date" width="170px" sortable="column" prop="snaptime">
                  <template slot-scope="scope">
                    {{
                      scope.row.snaptime &&
                      dateFormat(
                        new Date(scope.row.snaptime * 1000),
                        "yyyy-MM-dd hh:mm:ss"
                      )
                    }}
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination class="page-table-pagination" @size-change="(val) => {
                currentPage = 1;
                pageSize = val;
              }
                " @current-change="(val) => {
                  currentPage = val;
                }
                  " :current-page="currentPage" :page-sizes="[5, 10, 50]" :page-size="pageSize"
                v-if="!isTemplate && hasSnapshots" :total="(snapdbshotList && snapdbshotList.length) || 0"
                :pager-count="5" small layout="total, sizes, prev, pager, next, jumper">
              </el-pagination>

              <m-input label="VM ID" labelWidth="100px" prop="vmid" v-model="vmid" validateEvent @validate="validate"
                :show-error="rules['vmid'].error" :error-msg="rules['vmid'].message" />

              <m-select prop="storage" label="Target Storage" labelWidth="100px" :readonly="true"
                @on-change="handleTargetStorageSel" v-model="storage" placeholder="Same as Source"
                :disabled="clonemode && clonemode === 'clone' && !isTemplate">
                <m-option v-for="(item, index) in storageList" :key="index" :label="item.storage" :value="item.storage">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Name</div>
                    <div class="table-td">Type</div>
                    <div class="table-td">Available</div>
                    <div class="table-td">Capacity</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.storage">{{
                      item.storage
                    }}</span>
                    <span class="table-td" :title="item.type">{{
                      item.type
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.avail)">{{
                      byteToSize(item.avail)
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.total)">{{
                      byteToSize(item.total)
                    }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-input label="Name" labelWidth="100px" prop="name" @validate="validate" validateEvent
                :show-error="rules['name'].error" :error-msg="rules['name'].message" v-model="name" />

              <m-select prop="pool" label="Resource Pool" labelWidth="100px" :readonly="true"
                @on-change="(value) => (pool = value)" v-model="pool" placeholder="Please Select Resource Pool">
                <m-option v-for="(item, index) in poolList" :key="item.poolid" :label="item.poolid"
                  :value="item.poolid">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Resource Pool</div>
                    <div class="table-td">Note</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.poolid">{{
                      item.poolid
                    }}</span>
                    <span class="table-td" :title="item.comment">{{
                      item.comment
                    }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-select prop="format" label="Format" labelWidth="100px" @on-change="(value) => (format = value)"
                v-model="format" :readonly="false" :disabled="!storageType || storageType !== 'dir'"
                placeholder="Please Select Format">
                <m-option v-for="(item, index) in formatList" :key="index" :value="item.value" :label="item.label">
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </template>

      <template v-if="modalType === 'ha'">
        <div class="m-form__section">
          <m-input :label="qemu.type && qemu.type === 'qemu' ? 'VM' : 'CT'" :disabled="true" labelWidth="100px">
            <div slot="other" style="height: 28px; line-height: 28px; padding-left: 5px" class="disabled">
              {{ qemu.vmid && qemu.vmid }}
            </div>
          </m-input>

          <m-select prop="group" label="Group" labelWidth="100px" :readonly="true"
            @on-change="(value) => (group = value)" v-model="group" validateEvent @validate="validate"
            :show-error="rules['group'].error" :error-msg="rules['group'].message" required
            placeholder="Please Select Group">
            <m-option v-for="(item, index) in groupList" :key="item.group" :label="item.group" :value="item.group">
              <div v-if="index === 0" class="table-tr">
                <div class="table-td">Group</div>
                <div class="table-td">Node</div>
                <div class="table-td">Note</div>
              </div>
              <div class="table-tr">
                <span class="table-td" :title="item.group">{{
                  item.group
                }}</span>
                <span class="table-td" :title="item.nodes">{{
                  item.nodes
                }}</span>
                <span class="table-td" :title="item.comment">{{
                  item.comment
                }}</span>
              </div>
            </m-option>
          </m-select>

          <m-input label="Max Restart" labelWidth="100px" prop="max_restart" v-model="max_restart" />

          <m-select prop="state" label="Request Status" labelWidth="100px" :readonly="true"
            @on-change="(value) => (state = value)" v-model="state" placeholder="Please Select Request Status">
            <m-option v-for="item in comboItems" :key="item.value" :label="item.label" :value="item.value">
            </m-option>
          </m-select>

          <m-input label="Max Relocate" labelWidth="100px" prop="max_relocate" v-model="max_relocate" />

          <m-input label="Note" labelWidth="100px" type="textarea" prop="comment" v-model="comment" />
        </div>
      </template>

      <template v-if="modalType === 'delete'">
        <div class="m-form__section">
          <div class="delete-content">
            <base-icon name="icon-warning" class="delete-icon"></base-icon>
            <ul class="delete-des">
              <li>{{ qemu.vmid }} - Destroy</li>
              <li>
                Please enter ID to confirm {{ qemu.vmid }}:
                <m-input v-model="id" labelWidth="100px" validateEvent @validate="validate"
                  :show-error="rules['id'].error" :error-msg="rules['id'].message" required prop="id" />
              </li>
              <li><m-checkbox v-model="isClear">Clear</m-checkbox></li>
            </ul>
          </div>
        </div>
      </template>

      <m-dialog :visible="showLog" @close="closeLog" v-if="showLog" :_style="{
        width: '800px',
      }" :title="extraTitle">
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="Output" name="log"></m-tab-panel>
            <m-tab-panel label="Status" name="status"></m-tab-panel>
          </m-tab>
          <m-button class="create-btn m-margin-top-10" type="primary" @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'">Stop</m-button>
          <el-scrollbar style="height: 100%" id="taskModal">
            <div class="taskmodal-content" ref="taskmodal-content">
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
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
    </template>
    <template slot="footer">
      <m-button :disabled="!migration.possible" type="primary" class="create-btn" @on-click="confirm">{{
        modalType === "migrate"
          ? "Migrate"
          : modalType === "clone"
            ? "Clone"
            : modalType === "delete"
              ? "Delete"
              : "Add/Modify"
      }}</m-button>
    </template>
  </m-dialog>
</template>

<script>
import {
  byteToSize,
  percentToFixed,
  stringFormat,
  browserLocalStorageGetItem,
  dateFormat,
  chunkData,
  debounce,
  quickSort,
} from "@libs/utils/index";
import QemuOrLcxIndexHttp from "@src/views/home/qemu/http";
import { gettext } from "@src/i18n/local_zhCN.js";
import BaseIcon from "@src/components/icon/BaseIcon";
export default {
  name: "OperateModal",
  mixins: [QemuOrLcxIndexHttp],
  components: {
    BaseIcon,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    modalType: {
      type: String,
      default: "",
    },
    isLeft: {
      type: Boolean,
      default: false,
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  computed: {
    /**
     * Set mode
     */
    setMode() {
      if (this.running) {
        if (this.qemu && this.qemu.type === "qemu") {
          return "Online";
        } else if (this.qemu && this.qemu.type === "lxc") {
          return "Restart Mode";
        } else {
          return "Offline";
        }
      } else {
        return "Offline";
      }
    },
    /**
     * Whether to hide force
     */
    setLocalResourceCheckboxHidden() {
      let ticket = JSON.parse(browserLocalStorageGetItem("ticket"));
      if (
        this.running ||
        !this.migration.hasLocalResources ||
        ticket.username !== "root@pam"
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  data() {
    return {
      storage: "",
      nodename: "",
      qemu: {},
      storageList: [],
      nodeList: [],
      migreateObj: {},
      running: false,
      showLog: false,
      interval: null,
      tab: "log",
      extraTitle: "",
      pageSize: 5,
      currentPage: 1,
      snapdbshotList: [],
      //--------Clone
      storageType: "",
      format: "qcow2",
      vmid: "",
      snapshotname: "",
      pool: "",
      poolList: [],
      snapshotList: [],
      name: "",
      clonemode: "copy",
      isTemplate: false,
      snaphot: "",
      modeList: [{ value: "copy", label: gettext("Full Clone") }],
      formatList: [
        {
          label: "Raw Disk Image (raw)",
          value: "raw",
        },
        {
          label: "VMware Image Format (vmdk)",
          value: "vmdk",
        },
        {
          label: "QEMU Image Format (qcow2)",
          value: "qcow2",
        },
      ],
      //--------
      //<------ha
      state: "started",
      max_restart: 1,
      max_relocate: 1,
      groupList: [],
      group: "",
      haResource: {},
      comment: "",
      hasSnapshots: false,
      comboItems: [
        { value: "started", label: "started" },
        { value: "stopped", label: "stopped" },
        { value: "ignored", label: "ignored" },
        { value: "disabled", label: "disabled" },
      ],
      //------->
      //+++++delete
      id: "",
      isClear: false,
      migration: {
        possible: true,
        preconditions: [],
        "with-local-disks": 0,
        mode: undefined,
        allowedNodes: undefined,
        overwriteLocalResourceCheck: false,
        hasLocalResources: false,
      },
      rules: {
        nodename: {
          error: false,
          message: "",
        },
        vmid: {
          error: false,
          message: "",
        },
        snapshotname: {
          error: false,
          message: "",
        },
        group: {
          error: false,
          message: "",
        },
        id: {
          error: false,
          message: "",
        },
        name: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    let last = window.localStorage.getItem("lastsel") || "[]";
    this.qemu = (JSON.parse(last) && JSON.parse(last)) || "";
    //Initialize request
    this.__init__();
  },
  methods: {
    chunkData,
    byteToSize,
    percentToFixed,
    dateFormat,
    debounce,
    /**
     * Close dialog
     */
    close() {
      this.$emit("close");
    },
    /**
     * Search snapshot
     */
    searchSnapshot() {
      let _this = this;
      _this.currentPage = 1;
      _this.snapdbshotList = quickSort(
        _this.snapshotList.filter((item) => {
          return (
            window
              .encodeURIComponent(item.name)
              .indexOf(window.encodeURIComponent(_this.snaphot)) > -1 &&
            item.name !== "current"
          );
        }),
        "snaptime",
        "-"
      );
      if (!_this.snaphot) {
        _this.snapdbshotList = quickSort(
          _this.snapshotList.filter((item) => {
            return item.name !== "current";
          }),
          "snaptime",
          "-"
        );
      }
    },
    /**
     * Confirm operation
     */
    confirm() {
      //Overall validation
      if (this.validateAll()) return;
      let _this = this;
      if (_this.modalType === "migrate") {
        let params = {
          target: _this.nodename,
        };
        if (_this.migration.mode) {
          params[_this.migration.mode] = 1;
        }
        if (_this.migration["with-local-disks"]) {
          params["with-local-disks"] = 1;
        }
        //only submit targetstorage if vm is running, storage migration to different storage is only possible online
        if (
          _this.migration["with-local-disks"] &&
          _this.db.qemuObj.status === "running"
        ) {
          params.targetstorage = _this.storage;
        }
        if (_this.migration.overwriteLocalResourceCheck) {
          params["force"] = 1;
        }
        this.extraTitle = stringFormat(
          " ({0} ---> {1})",
          _this.qemu.node,
          params.target
        );
        _this
          .migreate(params)
          .then((res) => {
            _this.showLog = true;
            this.updateTable({
              tableName: "addClusterLogList",
              list: [],
            });
            _this.interval = window.setInterval(() => {
              _this.queryStatus(this.db.addClusterStatusObj.upid);
              _this.queryLog(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
              this.$nextTick(() => {
                if (this.tab === "log") {
                  document.querySelector(".el-scrollbar__view").scrollTop =
                    this.$refs["taskmodal-content"].scrollHeight;
                } else {
                  document.querySelector(".el-scrollbar__view").scrollTop = 0;
                }
              });
            }, 3000);
          })
          .catch((res) => {
            _this.$confirm.confirm({
              msg: res,
              icon: "icon-question",
            });
          });
      }
      if (this.modalType === "clone") {
        let params = { newid: _this.vmid };
        if (_this.snapshotname && _this.snapshotname !== "current") {
          params.snapname = _this.snapshotname;
        }
        if (_this.pool) {
          params.pool = _this.pool;
        }
        if (_this.name) {
          if (_this.qemu.type === "lxc") {
            params.hostname = _this.name;
          } else {
            params.name = _this.name;
          }
        }
        if (_this.nodename) {
          params.target = _this.nodename;
        }
        if (_this.clonemode === "copy") {
          params.full = 1;
          if (_this.storage) {
            params.storage = _this.storage;
            if (_this.format && _this.qemu.type !== "lxc") {
              params.format = _this.format;
            }
          }
        } else {
          params.full = 0;
        }
        _this
          .clone(params)
          .then((res) => {
            _this.extraTitle = "Clone Progress";
            _this.showLog = true;
            this.updateTable({
              tableName: "addClusterLogList",
              list: [],
            });
            _this.interval = window.setInterval(() => {
              _this.queryStatus(_this.db.addClusterStatusObj.upid);
              _this.queryLog(
                _this.db.addClusterStatusObj.node,
                _this.db.addClusterStatusObj.upid
              );
            }, 3000);
          })
          .catch((res) => {
            _this.$confirm.confirm({
              msg: res,
              icon: "icon-question",
            });
          });
      }
      if (this.modalType === "ha") {
        let params = {};
        if (this.state) params["state"] = this.state;
        if (this.comment) params["comment"] = this.comment;
        if (this.qemu.vmid) params["sid"] = this.qemu.vmid;
        if (this.max_restart && this.max_restart !== 1)
          params["max_restart"] = this.max_restart;
        if (this.max_relocate && this.max_relocate !== 1)
          params["max_relocate"] = this.max_relocate;
        if (this.group) params["group"] = this.group;
        if (this.isCreate) {
          this.mangeHa(params)
            .then((res) => {
              this.close();
            })
            .catch((res) => {
              this.$confirm.confirm({
                msg: res,
                icon: "icon-warning",
              });
            });
        } else {
          delete params["sid"];
          params["digest"] = this.haResource.digest;
          this.updateHa(this.qemu.vmid, params)
            .then((res) => {
              this.close();
            })
            .catch((res) => {
              this.$confirm.confirm({
                msg: res,
                icon: "icon-warning",
              });
            });
        }
      }
      if (this.modalType === "delete") {
        this.extraTitle = "Task Viewer: Delete Log";
        let params = {};
        if (this.isClear)
          params = {
            purge: 1,
          };
        this.deleteQemu(params)
          .then((res) => {
            this.showLog = true;
            this.updateTable({
              tableName: "addClusterLogList",
              list: [],
            });
            _this.interval = window.setInterval(() => {
              _this.queryStatus(this.db.addClusterStatusObj.upid);
              _this.queryLog(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
            }, 3000);
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
              icon: "icon-warning",
            });
          });
      }
    },
    /**
     * Initialize request
     */
    async __init__() {
      let _this = this;
      if (!this.isLeft) {
        await this.queryResource();
      } else {
        this.qemu = this.param;
      }
      await this.queryNodeList();
      if (this.modalType === "migrate") {
        this.checkMigratePreconditions();
      }
      if (this.modalType === "clone") {
        if (this.qemu.template || false) {
          _this.isTemplate = true;
        }
        if (JSON.stringify(_this.modeList).indexOf("clone") < 0)
          _this.modeList.push({
            value: "clone",
            label: gettext("Linked Clone"),
          });
        _this.$nextTick(() => {
          _this.clonemode = "clone";
        });
        this.querySnapShot({ _dc: new Date().getTime() }).then((res) => {
          _this.hasSnapshots =
            _this.snapshotList.length === 1 &&
              _this.snapshotList[0].name === "current"
              ? false
              : true;
          this.snapdbshotList = quickSort(
            this.snapshotList.map((item) => {
              if (item.name == "current") {
                item.snaptime = new Date().getTime() / 1000;
              }
              return item;
            }),
            "snaptime",
            "-"
          );
          if (_this.snapdbshotList && _this.hasSnapshots)
            _this.snapshotname = _this.snapdbshotList[1].name;
        });
        this.queryNextVmid({ _dc: new Date().getTime() });
        this.queryPool();
        if (this.nodeList) {
          this.nodename =
            (this.nodeList &&
              this.nodeList.length > 0 &&
              this.nodeList[0].node) ||
            "";
          this.queryTargetStorage();
        }
      }
      //Storage can be selected when online
      if (
        this.db.qemuObj.status === "running" &&
        this.modalType === "migrate"
      ) {
        this.queryStorageList(this.nodename, { format: 1, content: "images" });
      }
      //If it's HA
      if (this.modalType === "ha") {
        if (
          this.db.qemuObj &&
          this.db.qemuObj.ha &&
          String(this.db.qemuObj.ha.managed) === "0"
        ) {
          this.isCreate = true;
        }
        if (!this.isCreate) {
          await _this.queryHaResource(_this.qemu.vmid, {
            _dc: new Date().getTime(),
          });
          Object.keys(_this.haResource).forEach((key) => {
            _this[key] = _this.haResource[key];
          });
        }
        this.getGroups();
      }
    },
    /**
     * Validate fields
     */
    validate(prop) {
      debugger;
      let value = String(this[prop]).trim();
      this.rules[prop].message = "";
      this.rules[prop].error = false;
      if (prop !== "name" && /^\s*$/.test(value)) {
        this.rules[prop].message = "Cannot be empty!";
        this.rules[prop].error = true;
        return;
      }
      if (this.modalType === "clone" && prop === "nodename") {
        if (this.qemu.type === "qemu" && this.nodename !== this.qemu.node) {
          this.rules[prop].message = `${this.nodename} operation not allowed!`;
          this.rules[prop].error = true;
          return;
        }
      }
      if (this.modalType === "clone" && prop === "name") {
        if (/^[^a-zA-Z0-9]|[\u4e00-\u9fa5]/.test(this.name)) {
          this.rules[prop].message = `Invalid name!`;
          this.rules[prop].error = true;
          return;
        }
      }
    },
    /**
     * Query target storage
     */
    async queryTargetStorage() {
      this.storageList = [];
      this.storage = "";
      let _this = this;
      this.queryStorageList(_this.qemu.node, {
        format: 1,
        content: "images",
        target: _this.nodename,
      }).then((res) => {
        _this.storageList = _this.storageList.filter((item) => {
          return (
            item.content.indexOf(
              _this.qemu.type === "qemu" ? "images" : "rootdir"
            ) > -1
          );
        });
      });
    },
    /**
     * Overall validation
     */
    validateAll() {
      let props = [];
      if (this.modalType === "migrate") props = ["nodename"];
      if (this.modalType === "ha") props = ["group"];
      if (this.modalType === "delete") props = ["id"];
      props.forEach((item) => this.validate(item));
      return props.some((prop) => this.rules[prop].error === true);
    },
    /**
     * Assemble prompt information
     */
    async checkQemuPreconditions(resetMigrationPossible) {
      let _this = this;
      if (_this.db.qemuObj.status === "running") {
        _this.migration.mode = "online";
      }
      await _this.queryMigrate({ _dc: new Date().getTime() });
      if (_this.migreateObj.running) {
        _this.running = true;
      }
      if (resetMigrationPossible) _this.migration.possible = true;
      _this.migration.preconditions = [];
      if (_this.migreateObj.allowed_nodes) {
        _this.migration.allowedNodes = _this.migreateObj.allowed_nodes;
        let target = _this.nodename;
        if (
          target.length &&
          !_this.migreateObj.allowed_nodes.includes(target)
        ) {
          let disallowed = _this.migreateObj.not_allowed_nodes[target];
          let missing_storages = disallowed.unavailable_storages.join(", ");

          _this.migration.possible = false;
          _this.migration.preconditions.push({
            text:
              "Storage (" +
              missing_storages +
              ") not available on selected target. " +
              "Start VM to use live storage migration or select other target node",
            severity: "error",
          });
        }
      }
      if (_this.migreateObj.local_resources.length) {
        _this.migration.hasLocalResources = true;
        if (!_this.migration.overwriteLocalResourceCheck || _this.running) {
          _this.migration.possible = false;
          _this.migration.preconditions.push({
            text: stringFormat(
              "Can't migrate VM with local resources: {0}",
              _this.migreateObj.local_resources.join(", ")
            ),
            severity: "error",
          });
        } else {
          _this.migration.preconditions.push({
            text: stringFormat(
              "Migrate VM with local resources: {0}. " +
              "This might fail if resources aren't available on the target node.",
              _this.migreateObj.local_resources.join(", ")
            ),
            severity: "warning",
          });
        }
      }
      if (_this.migreateObj.local_disks.length) {
        _this.migreateObj.local_disks.forEach((disk) => {
          if (disk.cdrom && disk.cdrom === 1) {
            if (disk.volid.includes("vm-" + _this.qemu.vmid + "-cloudinit")) {
              if (_this.running) {
                _this.migration.possible = false;
                _this.migration.preconditions.push({
                  text: "Can't live migrate VM with local cloudinit disk, use shared storage instead",
                  severity: "error",
                });
              } else {
                return;
              }
            } else {
              _this.migration.possible = false;
              _this.migration.preconditions.push({
                text: "Can't migrate VM with local CD/DVD",
                severity: "error",
              });
            }
          } else {
            _this.migration["with-local-disks"] = 1;
            _this.migration.preconditions.push({
              text:
                "Migration with local disk might take long: " +
                disk.volid +
                " (" +
                byteToSize(disk.size ? disk.size : 0) +
                ")",
              severity: "warning",
            });
          }
        });
      }
    },
    /**
     * Check if online/offline settings initialization operation
     */
    checkMigratePreconditions(resetMigrationPossible) {
      let _this = this,
        vmrec = _this.db.qemuObj;
      if (vmrec && vmrec.status === "running") {
        this.running = true;
      }
      if (_this.qemu.type === "qemu") {
        _this.checkQemuPreconditions(resetMigrationPossible);
      } else {
        _this.checkLxcPreconditions(resetMigrationPossible);
      }
      _this.nodeList = _this.nodeList.filter(
        (item) => _this.qemu.node !== item.node
      );
      if (_this.nodeList)
        _this.nodename =
          (_this.nodeList &&
            _this.nodeList.length > 0 &&
            _this.nodeList[0].node) ||
          "";
      //Only local storage migration is allowed in offline state
    },
    /**
     * Check LXC container status
     */
    checkLxcPreconditions(resetMigrationPossible) {
      let _this = this;
      if (_this.running) {
        this.migration.mode = "restart";
      }
    },
    /**
     * Switch tab
     */
    handleTabChange(tab) {
      this.tab = tab;
    },
    /**
     * Close task window
     */
    closeLog() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
        /**
         * Prevent errors from asynchronous operations
         */
        this.showLog = false;
        this.$nextTick(() => {
          this.close();
        });
      } else {
        this.showLog = false;
        this.close();
      }
    },
    /**
     * Cancel running task
     */
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    /**
     * Select storage
     */
    handleTargetStorageSel(val) {
      this.storageType = this.storageList.filter(
        (it) => it.storage === val
      )[0].type;
      if (this.storageType === "dir") {
        this.format = "qcow2";
      } else {
        this.format = "raw";
      }
      this.storage = val;
    },
    /**
     * Sort by property and order
     * @param {prop} string data property value
     * @param {order} string sort direction
     */
    handleSort({ prop, order }) {
      if (!order) return;
      this.currentPage = 1;
      this.snapdbshotList = quickSort(
        this.snapshotList.filter((item) => item.name !== "current"),
        "snaptime",
        order === "ascending" ? "-" : "+"
      );
    },
  },
  updated() {
    let _this = this;
    if (_this.showLog) {
      this.$nextTick(() => {
        if (this.tab === "log") {
          document.querySelector("#taskModal >.el-scrollbar__wrap").scrollTop =
            this.$refs["taskmodal-content"].scrollHeight;
        } else {
          document.querySelector(
            "#taskModal >.el-scrollbar__wrap"
          ).scrollTop = 0;
        }
      });
    }
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
};
</script>

<style scoped lang="less">
.delete {
  &-content {
    display: flex;
  }

  &-icon {
    flex: 1 1 auto;
    width: 36px;
  }

  &-des {
    flex: 10 1 auto;

    .m-checkbox {
      padding-left: 0px;
    }
  }
}

/deep/.el-input {
  width: 50px !important;
}

/deep/.el-input {
  width: 80px !important;
}

.el-table__body {
  font-size: 12px;
}
</style>
