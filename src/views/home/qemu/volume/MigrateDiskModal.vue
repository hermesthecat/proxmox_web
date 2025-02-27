<template>
  <m-dialog title="Move Disk" :visible="visible" v-if="visible" @confirm="confirm" @cancel="close" :_style="{
    width: '946px',
  }" @close="close">
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>Basic Information</dt>
          <dd>
            <m-input type="" labelWidth="100px" label="Sockets" v-model="disk" prop="Disk" :disabled="true">
              <div style="padding-left: 5px; height: 28px; line-height: 28px">
                {{ disk }}
              </div>
            </m-input>
            <m-select prop="storage" label="Storage" labelWidth="100px" @on-change="handleStorageSelect"
              v-model="storage" validateEvent v-show="modalType !== 'edit'" @validate="validate"
              :error-msg="rules['storage'].message" :show-error="rules['storage'].error" :readonly="true"
              placeholder="Please select cache">
              <div class="table">
                <m-option v-for="(item, index) in db.storageList" :key="item.storage" :value="item.storage"
                  :label="item.storage">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Name</div>
                    <div class="table-td">Type</div>
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
                    <div class="table-td" :title="byteToSize(item.avail)">
                      {{ byteToSize(item.avail) }}
                    </div>
                    <div class="table-td" :title="byteToSize(item.total)">
                      {{ byteToSize(item.total) }}
                    </div>
                  </div>
                </m-option>
              </div>
            </m-select>
            <m-select prop="format" label="Format" labelWidth="100px" @on-change="handleFormatSelect" v-model="format"
              :readonly="false" v-show="modalType === 'create'" :disabled="!storageType || storageType !== 'dir'"
              placeholder="Please select format">
              <m-option v-for="(item, index) in formatList" :key="index" :value="item.value" :label="item.label">
              </m-option>
            </m-select>
            <m-checkbox label="Delete Source" v-model="delete_origin"></m-checkbox>
          </dd>
        </dl>
      </div>
      <m-dialog :visible="showLog" @close="closeLog" :_style="{
        width: '800px',
      }" title="Task Viewer: Move Disk">
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
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px"
        @on-click="confirm()">Confirm</m-button>
    </template>
  </m-dialog>
</template>

<script>
import { VMCPUFlag, CPULIST } from "@libs/enum/enum";
import { byteToSize, dateFormat } from "@libs/utils/index";
import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
  name: "AddOrEditDiskModal",
  mixins: [VolumeHttp],
  props: {
    modalType: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
  },
  data() {
    return {
      disk: "",
      size: "",
      storageType: "raw",
      format: "raw",
      storage: "",
      interVal: null,
      showLog: false,
      tab: "log",
      delete_origin: true,
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
      rules: {
        storage: {
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
    byteToSize,
    dateFormat,
    __init__() {
      let _this = this;
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        _this.disk = _this.param.type;
      });
      _this.queryStorage({ format: 1, content: "images" });
    },
    // Confirm callback trigger
    confirm() {
      let param = {
        disk: this.disk,
        storage: this.storage,
        delete: this.delete_origin ? 0 : 1,
      };
      Object.keys(param).forEach((key) => {
        if (!param[key]) delete param[key];
      });
      // Confirm migration
      this.removeDisk(param, "move_disk")
        .then((res) => {
          this.showLog = true;
          // Show task progress log after successful response
          this.interVal = setInterval(() => {
            this.queryStatus(this.db.addClusterStatusObj.upid);
            this.queryLog(
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
    },
    close() {
      this.$emit("close");
    },
    // Single item validation
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty";
        return;
      }
    },
    // Overall validation
    validateAll() {
      let props = ["storage"];
      props.forEach((prop) => this.validate(prop));
      // Return true if any validation fails
      return props.some((prop) => this.rules[prop].error === true);
    },
    // Select target storage for migration
    handleStorageSelect(value) {
      this.storage = value;
      this.storageType = this.db.storageList.filter(
        (it) => it.storage === value
      )[0].type;
      if (this.storageType === "dir") this.format = "qcow2";
      else this.format = "raw";
    },
    // Select storage image format
    handleFormatSelect(value) {
      this.format = value;
    },
    // Close log window
    closeLog() {
      this.showLog = false;
      this.close();
    },
    // Stop current task
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    // Switch tab @param type: log or status
    handleTabChange(value) {
      this.tab = value;
    },
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
/deep/.el-table__body {
  font-size: 12px;
}

.cpu-check {
  width: 100%;
  white-space: nowrap;
}

.cpu-label {
  width: 55px;
  display: inline-block;
}
</style>
