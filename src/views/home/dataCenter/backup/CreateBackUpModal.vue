<template>
  <Dialog :visible="visible" v-if="visible" @cancel="close" @confirm="confirm" :title="title"
    :_style="{ width: '956px' }" @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-select type="text" prop="node" label="Node" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.node.error" :error-msg="rules.node.message" :readonly="false"
                @on-change="handleNodeSelect" v-model="node" placeholder="--All--">
                <m-option v-for="item in db.nodeList" :key="item.node" :label="item.node" :value="item.node">
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
              <m-input type="text" prop="mailto" label="Send Email To" labelWidth="100px" validateEvent
                @validate="validate" :show-error="rules.mailto.error" :error-msg="rules.mailto.message" v-model="mailto"
                placeholder="Please enter email" />
              <m-select type="text" prop="storage" label="Storage" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.storage.error" :error-msg="rules.storage.message" @on-change="handleStorageSelect"
                v-model="storage" placeholder="Please enter storage">
                <m-option v-for="item in db.storageList" :key="item.storage" :label="item.storage"
                  :value="item.storage">
                  <div class="table-tr">
                    <span class="table-td" :title="item.storage + ` (Name)`">{{ item.storage }} (Name)</span>
                    <span class="table-td" :title="item.type + ` (Type)`">{{ item.type }} (Type)</span>
                    <span class="table-td" :title="byteToSize(item.avail) + ` (Available)`">{{ byteToSize(item.avail) }}
                      (Available)</span>
                    <span class="table-td" :title="byteToSize(item.total) + ` (Total)`">{{ byteToSize(item.total) }}
                      (Total)</span>
                  </div>
                </m-option>
              </m-select>
              <m-select type="text" prop="mailnotification" label="Email Notification" labelWidth="100px"
                v-model="mailnotification" @on-change="handleNotificationChange" placeholder="Please enter guest user">
                <m-option v-for="item in mailnotificationList" :key="item.value" :label="item.label"
                  :value="item.value"></m-option>
              </m-select>
              <m-select type="multiple" prop="dow" label="Day of Week" labelWidth="100px" validateEvent v-model="dow"
                @on-change="handleDowSelect" placeholder="Please select day of week">
                <m-option v-for="item in dowList" :key="item.value" :label="item.label" :value="item.value"></m-option>
              </m-select>
              <m-select labelWidth="100px" @on-change="handleCompressSelect" prop="compress" v-model="compress"
                label="Compression">
                <m-option v-for="item in compressList" :key="item.value" :label="item.label"
                  :value="item.value"></m-option>
              </m-select>
              <m-select labelWidth="100px" @on-change="handleStartTimeSelect" prop="starttime" v-model="starttime"
                :readonly="false" label="Start Time" validateEvent @validate="validate"
                :show-error="rules.starttime.error" :error-msg="rules.starttime.message">
                <m-option v-for="item in starttimeoptions" :key="item.value" :label="item.label"
                  :value="item.value"></m-option>
              </m-select>
              <m-select type="number" prop="mode" label="Mode" labelWidth="100px" validateEvent min="0" v-model="mode"
                @on-change="handleModeSelect" placeholder="Please select mode">
                <m-option v-for="item in modeList" :label="item.label" :value="item.value" :key="item.value"></m-option>
              </m-select>
              <m-select type="text" prop="selMode" label="Selection Mode" labelWidth="100px" v-model="selMode"
                @on-change="handleSelMode" placeholder="Please select">
                <m-option v-for="item in selModeList" :label="item.label" :value="item.value"
                  :key="item.value"></m-option>
              </m-select>
              <m-select type="text" prop="pool" label="Pool to Backup" labelWidth="100px" v-model="pool"
                @on-change="handleSelPool" v-show="selMode === 'pool'" placeholder="Please select">
                <m-option v-for="item in db.poolList" :label="item.poolid" :value="item.poolid" :key="item.poolid">
                  <div class="table-tr">
                    <span class="table-td" :title="item.poolid + ` (Name)`">{{ item.poolid }} (Name)</span>
                    <span class="table-td" :title="item.comment + ` (Comment)`">{{ item.comment }} (Comment)</span>
                  </div>
                </m-option>
              </m-select>
              <m-checkbox label="Enable" v-model="enabled" labelWidth="100px"></m-checkbox>
            </dd>
          </dl>
          <dl>
            <dt>Virtual Machines</dt>
            <dd>
              <el-table :data="db.vmList" ref="dataTable" @selection-change="handleSelectChange">
                <el-table-column type="selection" width="55px" :selectable="selectable"></el-table-column>
                <el-table-column label="ID" prop="vmid"></el-table-column>
                <el-table-column label="Node" prop="node"></el-table-column>
                <el-table-column label="Status" prop="status">
                  <template slot-scope="scope">
                    <table-info-state :content="scope.row.status === 'running' ? 'Running' : 'Stopped'
                      " :state="scope.row.status === 'running' ? 'actived' : 'unActived'
                        "></table-info-state>
                  </template>
                </el-table-column>
                <el-table-column label="Name" prop="node"></el-table-column>
                <el-table-column label="Type" prop="type"></el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import DataCenterBackUpHttp from "@src/views/home/dataCenter/backup/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateBackUpModal",
  mixins: [DataCenterBackUpHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      node: "",
      storage: "",
      dow: ["sat"],
      starttime: "00:00",
      mailto: "",
      mailnotification: "always",
      compress: "0",
      mode: "snapshot",
      pool: "",
      enabled: true,
      selMode: "include",
      exclude: "",
      vmid: [],
      selModeList: [
        { value: "include", label: "Include Selected VMs" },
        { value: "all", label: "All" },
        { value: "exclude", label: "Exclude Selected VMs" },
        { value: "pool", label: "Pool Based" },
      ],
      modeList: [
        { value: "snapshot", label: "Snapshot" },
        { value: "suspend", label: "Suspend" },
        { value: "stop", label: "Stop" },
      ],
      compressList: [
        {
          value: "0",
          label: "None",
        },
        { value: "lzo", label: "LZO (Fast)" },
        { value: "gzip", label: "GZIP (Good)" },
      ],
      starttimeoptions: [],
      mailnotificationList: [
        {
          label: "Always",
          value: "always",
        },
        {
          label: "On Failure",
          value: "failure",
        },
      ],
      dowList: [
        {
          label: "Monday",
          value: "mon",
        },
        {
          label: "Tuesday",
          value: "tue",
        },
        {
          label: "Wednesday",
          value: "wed",
        },
        {
          label: "Thursday",
          value: "thu",
        },
        {
          label: "Friday",
          value: "fri",
        },
        {
          label: "Saturday",
          value: "sat",
        },
        {
          label: "Sunday",
          value: "sun",
        },
      ],
      rules: {
        node: {
          error: false,
          message: "",
        },
        storage: {
          error: false,
          message: "",
        },
        mailto: {
          error: false,
          message: "",
        },
        starttime: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j <= 45; j = j + 15) {
        this.starttimeoptions.push({
          label:
            (String(i).length < 2 ? `0${i}` : i) +
            ":" +
            (String(j).length < 2 ? `0${j}` : j),
          value:
            (String(i).length < 2 ? `0${i}` : i) +
            ":" +
            (String(j).length < 2 ? `0${j}` : j),
        });
      }
    }
    this.__init__();
  },
  methods: {
    percentToFixed,
    byteToSize,
    async __init__() {
      let _this = this;
      await _this.queryNodeList();
      await _this.queryResource();
      await _this
        .queryStorageList(_this.node ? _this.node : "localhost")
        .then(() => {
          if (
            _this.type === "create" &&
            _this.db.storageList &&
            _this.db.storageList.length > 0
          )
            _this.storage = _this.db.storageList[0].storage;
          _this.validate("storage");
        });
      await _this.queryPoolList().then(() => {
        if (
          _this.type === "create" &&
          _this.db.poolList &&
          _this.db.poolList.length > 0
        )
          _this.pool = _this.db.poolList[0].poolid;
      });
      if (_this.type === "create") {
        _this.node = "";
        _this.storage = "";
        _this.dow = ["sat"];
        _this.starttime = "00:00";
        _this.mailto = "";
        _this.mailnotification = "always";
        _this.compress = "0";
        _this.mode = "snapshot";
        _this.pool = "";
        _this.enabled = true;
        _this.selMode = "include";
        _this.exclude = "";
      } else {
        Object.keys(_this.param).forEach((it) => {
          if (it === "dow") {
            _this.dow = this.param[it].split(",");
          } else if (["vmid", "exclude"].includes(it)) {
            _this.selMode = it === "vmid" ? "include" : it;
            _this.db.vmList.forEach((row) => {
              _this.param[it].split(",").forEach((param) => {
                if (String(row.vmid) === param) {
                  _this.$refs &&
                    _this.$refs.dataTable.toggleRowSelection(row, true);
                  _this.vmid.concat(row.vmid);
                }
              });
            });
          } else if (it === "all") {
            _this.selMode = it;
            _this.db.vmList.forEach((row) => {
              _this.$refs.dataTable.toggleRowSelection(row, true);
              _this.vmid.concat(row.vmid);
            });
          } else if (it === "pool") {
            _this.selMode = it;
            _this.db.vmList.forEach((row) => {
              if (row.pool === this.param[it])
                _this.$refs.dataTable.toggleRowSelection(row, true);
              _this.vmid.concat(row.vmid);
            });
            this.pool = this.param[it];
          } else if (it === "enabled") {
            _this.enabled = _this.param[it] === "1" ? true : false;
          } else {
            _this[it] = _this.param[it];
            if (it === "storage") this.validate("storage");
          }
        });
      }
    },
    handleCompressSelect(value) {
      this.compress = value;
    },
    handleStartTimeSelect(value) {
      this.starttime = value;
    },
    handleDowSelect(value) {
      this.dow = value;
    },
    validate() { },
    handleNodeSelect(value) {
      this.node = value;
      this.queryStorageList(value);
    },
    handleStorageSelect(value) {
      this.storage = value;
    },
    handleNotificationChange(value) {
      this.mailnotification = value;
    },
    handleModeSelect(value) {
      this.mode = value;
    },
    handleSelMode(value) {
      this.selMode = value;
      switch (value) {
        case "all":
          this.db.vmList.forEach((row) => {
            this.$refs.dataTable.toggleRowSelection(row, true);
            this.vmid.concat(row.vmid);
          });
          break;
        case "pool":
          this.db.vmList.forEach((row) => {
            if (row.pool === this.pool)
              this.$refs.dataTable.toggleRowSelection(row, true);
            this.vmid.concat(row.vmid);
          });
          break;
        default:
          this.db.vmList.forEach((row) => {
            this.$refs.dataTable.toggleRowSelection(row, false);
          });
      }
    },
    handleSelPool(value) {
      this.pool = value;
    },
    selectable: function (row, index) {
      if (this.selMode === "all" || this.selMode === "pool") {
        return false;
      } else {
        return true;
      }
    },
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && ["starttime", "storage"].includes(prop)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty";
        return;
      }
      if (prop === "emailto") {
        if (
          !/(^[0-9A-Za-z|\u4e00-\u9fa5])@(0-9A-Za-z|\u4e00-\u9fa5).(a-zA-Z)/.test(
            value
          )
        ) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid email format!";
          return;
        }
      }
    },
    validateAll() {
      let props = ["starttime", "storage", "mailto"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleSelectChange(rows) {
      this.vmid = rows.map((row) => row.vmid);
    },
    confirm() {
      if (this.validateAll()) return;
      let params = {
        starttime: this.starttime,
        mode: this.mode,
        compress: this.compress,
        dow: this.dow.join(","),
        enabled: this.enabled ? 1 : 0,
        storage: this.storage,
        mailnotification: this.mailnotification,
        mailto: this.mailto,
      };
      if (this.selMode === "all") params["all"] = 1;
      if (this.selMode === "include") params["vmid"] = this.vmid.join(",");
      if (this.selMode === "exclude") params["exclude"] = this.vmid.join(",");
      if (this.selMode === "pool") params["pool"] = this.pool;
      this.node ? (params["node"] = this.node) : (params["delete"] = "node");
      if (this.type === "create")
        this.createBackUp(params).then(() => {
          this.close();
        });
      if (this.type !== "create") {
        params["id"] = this.param.id;
        this.updateBackUp(params).then(() => {
          this.close();
        });
      }
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.table {
  &-tr {
    display: table;
    height: 35px;
    line-height: 35px;
    min-width: 300px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
  }

  &-td {
    display: table-cell;
    height: 35px;
    line-height: 35px;
    max-width: 100px;
  }

  &-radio {
    width: 50px;
    padding-right: 20px;
  }
}
</style>
