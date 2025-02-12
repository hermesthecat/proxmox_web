<template>
  <m-dialog :visible="visible" @confirm="confirm" @cancel="close" @close="close" :_style="{
    width: '946px',
  }" :title="title">
    <div slot="content">
      <div class="m-form__section">
        <template v-if="modalType === 'backup'">
          <dl>
            <dt>Basic Operations</dt>
            <dd>
              <m-select v-model="storage" @on-change="(value) => (storage = value)" validateEvent @validate="validate"
                label="Storage" labelWidth="100px" prop="storage" required :show-error="rules['storage'].error"
                :error-msg="rules['storage'].message">
                <m-option v-for="(item, index) in qemuStorageList" :key="item.storage" :value="item.storage"
                  :label="item.storage">
                  <div class="table-tr" v-if="index === 0">
                    <div class="table-td">Name</div>
                    <div class="table-td">Category</div>
                    <div class="table-td">Available</div>
                    <div class="table-td">Capacity</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.storage">
                      {{ item.storage }}
                    </div>
                    <div class="table-td" :title="item.type">
                      {{ item.type }}
                    </div>
                    <div class="table-td" :title="item.avail ? byteToSize(item.avail) : '0'">
                      {{ item.avail ? byteToSize(item.avail) : "0" }}
                    </div>
                    <div class="table-td" :title="item.total ? byteToSize(item.total) : '0'">
                      {{ item.total ? byteToSize(item.total) : "0" }}
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select v-model="mode" @on-change="(value) => (mode = value)" label="Mode" labelWidth="100px"
                prop="mode">
                <m-option v-for="item in modeItems" :key="item.value" :value="item.value" :label="item.label">
                </m-option>
              </m-select>
              <m-select v-model="compress" @on-change="(value) => (compress = value)" label="Compression"
                labelWidth="100px" prop="compress">
                <m-option v-for="item in compressItems" :key="item.value" :value="item.value" :label="item.label">
                </m-option>
              </m-select>
              <m-input v-model="emailto" validateEvent prop="emailto" label="Send Email To" labelWidth="100px"
                @validate="validate" :show-error="rules['emailto'].error" :error-msg="rules['emailto'].message" />
            </dd>
          </dl>
        </template>
        <template v-if="modalType === 'restore'">
          <dl>
            <dt>Basic Operations</dt>
            <dd>
              <m-input :disabled="true" label="Source" labelWidth="100px">
                <div slot="other" class="disabled ellipsis" style="
                    height: 28px;
                    line-height: 28px;
                    padding-left: 5px;
                    padding-right: 5px;
                  ">
                  {{ param.volid.replace(/([\s\S]*)\\/, "") }}
                </div>
              </m-input>
              <m-select v-model="storage" @on-change="(value) => (storage = value)" validateEvent @validate="validate"
                label="Storage" labelWidth="100px" prop="storage" required :show-error="rules['storage'].error"
                placeholder="From backup configuration" :error-msg="rules['storage'].message">
                <m-option v-for="(item, index) in qemuStorageList" :key="item.storage" :value="item.storage"
                  :label="item.storage">
                  <div class="table-tr" v-if="index === 0">
                    <div class="table-td">Name</div>
                    <div class="table-td">Category</div>
                    <div class="table-td">Available</div>
                    <div class="table-td">Capacity</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.storage">
                      {{ item.storage }}
                    </div>
                    <div class="table-td" :title="item.type">
                      {{ item.type }}
                    </div>
                    <div class="table-td" :title="item.avail ? byteToSize(item.avail) : '0'">
                      {{ item.avail ? byteToSize(item.avail) : "0" }}
                    </div>
                    <div class="table-td" :title="item.total ? byteToSize(item.total) : '0'">
                      {{ item.total ? byteToSize(item.total) : "0" }}
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-input :disabled="true" label="VM" labelWidth="100px">
                <div slot="other" class="disabled" style="height: 28px; line-height: 28px; padding-left: 5px">
                  {{ this.node.vmid }}
                </div>
              </m-input>
              <div style="position: relative">
                <m-input v-model="bwlimit" validateEvent @validate="validate" label="Read Limit" labelWidth="100px"
                  prop="bwlimit" :show-error="rules['bwlimit'].error" :error-msg="rules['bwlimit'].message" />Mib
                <div class="warning">Use "0" to disable all bandwidth limits</div>
              </div>
              <m-checkbox v-model="start" label="Start after restore" labelWidth="100px"></m-checkbox>
              <m-checkbox v-model="unprivileged" v-if="node.type === 'lxc'" label="Unprivileged container"
                labelWidth="100px"></m-checkbox>
            </dd>
          </dl>
        </template>
        <template v-if="modalType === 'config'">
          <ace-editor v-model="configContent" ref="ace-editor" :readOnly="true"
            style="max-height: 400px; overflow-y: auto"></ace-editor>
        </template>
      </div>
      <m-dialog :visible="showLog" @close="closeLog" :_style="{
        width: '800px',
      }" title="View: Backup Task Progress">
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
    </div>
    <template slot="footer">
      <m-button v-if="modalType === 'backup'" type="primary" class="create-btn" icon="fa fa-save"
        @on-click="confirm">Backup</m-button>
      <m-button v-if="modalType === 'restore'" type="primary" class="create-btn" @on-click="confirm"
        icon="fa fa-retweet">Restore</m-button>
      <span v-show="modalType === 'config'"></span>
    </template>
  </m-dialog>
</template>

<script>
import QemuBackUpHttp from "@src/views/home/qemu/backup/http";
import MButton from "@src/components/button/Button";
import { gettext } from "@src/i18n/local_zhCN.js";
import {
  dateFormat,
  byteToSize,
  quickSort,
  throttle,
  format_task_description,
} from "@libs/utils/index";
import AceEditor from "@src/components/ace/AceEditor.vue";
export default {
  components: { AceEditor },
  name: "BackUpOperateModal",
  mixins: [QemuBackUpHttp],
  props: {
    title: {
      //Modal title
      type: String,
      default: "",
    },
    modalType: {
      //Modal type: backup for backup, restore for restore, watch for view
      type: String,
      default: "",
    },
    visible: {
      //Modal show/hide
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
  //Initialize state
  data() {
    return {
      storage: "", //Storage
      compress: "zstd", //Compression method
      mode: "snapshot", //Backup mode
      emailto: "", //Send email to
      qemuStorageList: [],
      showLog: false, //Show task progress
      tab: "log", //Default show log
      interVal: null, //Timer ID
      bwlimit: "", //Read limit
      start: false,
      unprivileged: true,
      configContent: "",
      modeItems: [
        { value: "snapshot", label: "Snapshot" },
        { value: "suspend", label: "Suspend" },
        { value: "stop", label: "Stop" },
      ],
      compressItems: [
        {
          value: "0",
          label: "None",
        },
        { value: "lzo", label: "LZO (Fast)" },
        { value: "gzip", label: "GZIP (Good)" },
        { value: "zstd", label: "ZSTD (Fast and Good)" },
      ],
      rules: {
        storage: {
          error: false,
          message: "",
        },
        emailto: {
          error: false,
          message: "",
        },
        bwlimit: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    dateFormat,
    byteToSize,
    quickSort,
    throttle,
    //Initialize request
    async __init__() {
      let _this = this;
      await _this
        .queryQemuStorageList({ format: 1, content: "backup" })
        .then((res) => {
          _this.qemuStorageList = quickSort(
            this.db.storageList,
            "storage",
            "+"
          );
          if (_this.modalType === "backup")
            _this.storage = _this.qemuStorageList[0]
              ? _this.qemuStorageList[0].storage
              : "local";
        });
      if (this.modalType === "config") {
        _this.queryConfig({
          _dc: new Date().getTime(),
          volume: this.param.volid,
        });
        _this.$refs[`ace-editor`].$el.style.height =
          _this.$el.parentElement.clientHeight - 100 + "px";
        window.addEventListener("resize", _this.updateAceEditorHeight, false);
      }
    },
    updateAceEditorHeight() {
      let _this = this;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$el.parentElement.clientHeight - 100 + "px";
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
     * @tab log, stastus
     */
    handleTabChange(tab) {
      this.tab = tab;
    },
    /**
     * Close log dialog
     */
    closeLog() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.showLog = false;
      this.close();
    },
    //Single validation
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && prop !== "emailto" && prop !== "bwlimit") {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty!";
        return;
      }
      if (prop === "emailto" && value && !/\w+@(\w+)\.(\w+)$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Invalid email format!";
        return;
      }
    },
    //Close dialog
    close() {
      this.$emit("close");
    },
    //Overall validation
    validateAll() {
      let _this = this,
        props = [];
      if (this.modalType === "backup") {
        props = ["storage", "emailto"];
      }
      if (this.modalType === "restore") {
        props = ["storage"];
      }
      props.forEach((prop) => _this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //Confirm
    confirm() {
      if (this.validateAll()) return;
      if (this.modalType === "backup") {
        let param = {
          storage: this.storage,
          vmid: this.node.vmid,
          mode: this.mode,
          remove: 0,
          mailto: this.mailto,
          compress: this.compress,
        };
        this.createBackUp(param)
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
            });
          });
      }
      if (this.modalType === "restore") {
        var params = {
          vmid: this.node.vmid,
          force: this.node.vmid ? 1 : 0,
        };
        if (this.unique) {
          params.unique = 1;
        }
        if (this.start) {
          params.start = 1;
        }
        if (this.storage) {
          params.storage = this.storage;
        }
        if (this.bwlimit !== undefined) {
          params.bwlimit = this.bwlimit;
        }
        var url;
        var msg;
        if (this.node.type === "lxc") {
          url = "json/nodes/" + this.node.node + "/lxc";
          params.ostemplate = this.param.volid;
          params.restore = 1;
          if (this.unprivileged) {
            params.unprivileged = 1;
          }
          msg = format_task_description("vzrestore", params.vmid);
        } else if (this.node.type === "qemu") {
          url = "json/nodes/" + this.node.node + "/qemu";
          params.archive = this.param.volid;
          msg = format_task_description("qmrestore", params.vmid);
        } else {
          throw "unknown VM type";
        }
        if (this.node.vmid) {
          msg += ". " + gettext("This will permanently erase current VM data.");
          this.$confirm
            .confirm({
              msg,
            })
            .then((res) => {
              this.restore(url, params)
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
                  });
                });
            });
        } else {
          this.krestore(url, params)
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
              });
            });
        }
      }
    },
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
    window.removeEventListener("resize", this.updateAceEditorHeight, false);
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}

.warning {
  padding: 1px 20px;
  position: absolute;
  font-size: 12px;
  background-color: #fc0;
  color: #fff;
  top: 32px;
  left: 113px;
}
</style>
