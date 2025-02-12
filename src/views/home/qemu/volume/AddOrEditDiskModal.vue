<template>
  <m-dialog title="Add Disk" :visible="visible" v-if="visible" @confirm="confirm" @cancel="close" :_style="{
    width: '946px',
  }" @close="close">
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>Basic Information</dt>
          <dd>
            <m-input type="number" label="Bus" v-model="deviceIndex" labelWidth="100px" min="0" prop="deviceIndex"
              :_style="{ paddingLeft: '115px' }" @validate="validate" v-show="isShow()" required
              :error-msg="rules['deviceIndex'].message" :show-error="rules['deviceIndex'].error">
              <div slot="prefix" style="
                  display: inline-block;
                  position: absolute;
                  top: -16px;
                  left: -6px;
                  height: 100%;
                ">
                <div class="m-margin-top-10 m-form__select" style="width: 115px">
                  <select class="m-form__select_inner" v-model="device" style="width: 110px">
                    <option v-for="item of deviceList" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </option>
                  </select>
                </div>
              </div>
            </m-input>
            <m-select prop="cache" label="Cache" labelWidth="100px" @on-change="handleCacheSelect" v-model="cache"
              :readonly="false" v-show="isShow()" placeholder="Please select cache">
              <m-option v-for="(item, index) in cacheList" :key="index" :value="item.value" :label="item.label">
              </m-option>
            </m-select>
            <m-input type="slot" v-show="isShow()" v-if="device === 'scsi'" label="SCSI Controller" labelWidth="100px"
              :disabled="true">
              <div slot="other" class="disabled" style="padding-left: 5px; height: 28px; line-height: 28px">
                LSI 53C895A
              </div>
            </m-input>
            <m-input type="number" labelWidth="100px" label="Disk Size" v-model="disksize" validateEvent @validate="validate"
              prop="disksize" required v-show="modalType === 'create'" :error-msg="rules['disksize'].message"
              :show-error="rules['disksize'].error" />
            <m-input type="slot" v-show="modalType === 'edit'" labelWidth="100px" label="Disk Image" :disabled="true">
              <div slot="other" style="height: 28px; line-height: 28px; padding-left: 5px" class="disabled">
                {{ editStorage }}
              </div>
            </m-input>
            <m-checkbox label="Discard" v-model="discard" labelWidth="100px" :disabled="device === 'virtio'"></m-checkbox>
            <m-select prop="storage" label="Storage" labelWidth="100px" @on-change="handleStorageSelect" v-model="storage"
              validateEvent v-show="modalType !== 'edit'" @validate="validate" :readonly="true" placeholder="Please select storage">
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
          </dd>
        </dl>
      </div>
      <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
        <dt>Advanced</dt>
        <dd>
          <m-checkbox v-model="ssd" label="SSD Emulation" :disabled="device === 'virtio'"></m-checkbox>
          <m-checkbox v-model="backup" label="No Backup"></m-checkbox>
          <m-checkbox v-model="iothread" label="IO Thread"
            :disabled="!(device === 'scsi' || device === 'virtio')"></m-checkbox>
          <m-checkbox v-model="replicate" label="Skip Replication"></m-checkbox>
          <m-input label="Read Limit (MB/s)" labelWidth="110px" placeholder="Unlimited" type="number" v-model="mbps_rd"
            class="m-margin-top-10" />
          <m-input label="Write Limit (MB/s)" labelWidth="110px" placeholder="Unlimited" type="number" v-model="mbps_wr"
            class="m-margin-top-10" />
          <m-input label="Read Limit (ops/s)" labelWidth="110px" placeholder="Unlimited" type="number" prop="iops_rd"
            @validate="validate" validateEvent class="m-margin-top-10" required :show-error="rules['iops_rd'].error"
            :error-msg="rules['iops_rd'].message" v-model="iops_rd" />
          <m-input label="Write Limit (ops/s)" labelWidth="110px" placeholder="Unlimited" type="number" prop="iops_wr"
            class="m-margin-top-10" @validate="validate" validateEvent :show-error="rules['iops_wr'].error"
            :error-msg="rules['iops_wr'].message" v-model="iops_wr" />
          <m-input label="Read Max Burst (MB)" labelWidth="110px" placeholder="Default" type="number" v-model="mbps_rd_max"
            class="m-margin-top-10" />
          <m-input label="Write Max Burst (MB)" labelWidth="110px" placeholder="Default" type="number" v-model="mbps_wr_max"
            class="m-margin-top-10" />
          <m-input label="Read Max Burst (ops)" labelWidth="110px" placeholder="Default" type="number" prop="iops_rd_max"
            @validate="validate" class="m-margin-top-10" validateEvent :show-error="rules['iops_rd_max'].error"
            :error-msg="rules['iops_rd_max'].message" v-model="iops_rd_max" />
          <m-input label="Write Max Burst (ops)" labelWidth="110px" placeholder="Default" type="number" prop="iops_wr_max"
            @validate="validate" class="m-margin-top-10" validateEvent required :show-error="rules['iops_wr_max'].error"
            :error-msg="rules['iops_wr_max'].message" v-model="iops_wr_max" />
        </dd>
      </div>
    </div>
    <template slot="footer">
      <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>Advanced</div>
        </label>
      </div>
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px" @on-click="confirm()">Confirm</m-button>
    </template>
  </m-dialog>
</template>

<script>
import { DEVICELIST, CACHELIST } from "@libs/enum/enum";
import { byteToSize } from "@libs/utils/index";
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
      deviceList: DEVICELIST,
      cacheList: CACHELIST,
      deviceIndex: "1",
      cache: "none",
      iops_wr_max: "",
      iops_rd_max: "",
      mbps_wr_max: "",
      mbps_rd_max: "",
      iops_wr: "",
      iops_rd: "",
      mbps_rd: "",
      mbps_wr: "",
      replicate: false,
      iothread: "",
      ssd: false,
      backup: false,
      format: "qcow2",
      disksize: "32",
      device: "scsi",
      discard: "",
      isAdvice: true,
      storage: "",
      storageType: "",
      editStorage: "",
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
        deviceIndex: {
          error: false,
          message: "",
        },
        disksize: {
          error: false,
          message: "",
        },
        iops_rd: {
          error: false,
          message: "",
        },
        iops_wr: {
          error: false,
          message: "",
        },
        iops_rd_max: {
          error: false,
          message: "",
        },
        iops_wr_max: {
          error: false,
          message: "",
        },
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
    __init__() {
      let _this = this;
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        if (_this.param.type) {
          _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
          ["iops_rd", "iops_wr", "iops_rd_max", "iops_wr_max"].forEach(
            (item) => {
              _this.db.qemuConfigObj[_this.param.type].indexOf(item) >= 0;
              _this.isAdvice = true;
            }
          );
        }
      });
      _this.queryStorage({ format: 1, content: "images" });
    },
    parseValue(value) {
      let values = value.split(","),
        _this = this;
      if (values) {
        for (let i in values) {
          if (values[i].indexOf("=") < 0) {
            _this.editStorage = values[i];
          } else {
            if (["iothread", "ssd"].includes(values[i].split("=")[0])) {
              _this[values[i].split("=")[0]] =
                values[i].split("=")[1] === "1" ? true : false;
            } else if ("replicate".indexOf(values[i].split("=")[0]) >= 0) {
              _this[values[i].split("=")[0]] =
                values[i].split("=")[1] === "1" ? false : true;
            } else if ("discard".indexOf(values[i].split("=")[0]) >= 0) {
              _this[values[i].split("=")[0]] =
                values[i].split("=")[1] === "on" ? true : false;
            } else if ("backup".indexOf(values[i].split("=")[0]) >= 0) {
              _this[values[i].split("=")[0]] =
                values[i].split("=")[1] === "0" ? false : true;
            } else {
              _this[values[i].split("=")[0]] = values[i].split("=")[1];
            }
          }
        }
      }
    },
    isShow() {
      return (
        this.modalType !== "edit" ||
        (this.param && this.param.type && /(unused)/.test(this.param.type))
      );
    },
    confirm() {
      if (this.validateAll()) return;
      if (this.modalType !== "edit") {
        let device = "";
        if (this.cache) device += `cache=${this.cache},`;
        if (this.discard)
          device += `discard=${this.discard ? "on" : "ignore"},`;
        if (this.storage) device += `${this.storage}:${this.disksize},`;
        if (this.format) device += `format=${this.format},`;
        if (this.isAdvice) {
          if (typeof this.backup === "undefined")
            device += `backup=${this.backup ? "on" : "no"},`;
          if (typeof this.replicate === "undefined")
            device += `replicate=${this.replicate ? "on" : "no"},`;
          if (typeof this.ssd === "undefined")
            device += `ssd=${this.ssd ? 1 : 0},`;
          if (typeof this.iothread === "undefined")
            device += `iothread=${this.iothread ? "on" : "no"},`;
          if (this.iops_rd_max) device += `iops_rd_max=${this.iops_rd_max},`;
          if (this.iops_rd) device += `iops_rd=${this.iops_rd},`;
          if (this.iops_wr) device += `iops_wr=${this.iops_wr},`;
          if (this.iops_wr_max) device += `iops_wr_max=${this.iops_wr_max},`;
          if (this.mbps_wr) device += `mbps_wr=${this.mbps_wr},`;
          if (this.mbps_rd) device += `mbps_rd=${this.mbps_rd},`;
          if (this.mbps_rd_max) device += `mbps_rd_max=${this.mbps_rd_max},`;
          if (this.mbps_wr_max) device += `mbps_wr_max=${this.mbps_wr_max},`;
        }
        let param = {
          [`scsi${this.deviceIndex}`]: device.slice(0, device.length - 1),
          digest: this.db.qemuConfigObj.digest,
          background_delay: 5,
        };
        this.createHardWare(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      } else {
        let device = "";
        if (this.editStorage) device += `${this.editStorage},`;
        if (this.cache) device += `cache=${this.cache},`;
        if (this.discard)
          device += `discard=${this.discard ? "on" : "ignore"},`;
        if (this.isAdvice) {
          if (typeof this.backup !== "undefined")
            device += `backup=${this.backup ? "on" : "no"},`;
          if (typeof this.replicate !== "undefined")
            device += `replicate=${this.replicate ? "on" : "no"},`;
          if (typeof this.ssd !== "undefined")
            device += `ssd=${this.ssd ? "on" : "no"},`;
          if (typeof this.iothread !== "undefined")
            device += `iothread=${this.iothread ? "on" : "no"},`;
          if (this.iops_rd_max) device += `iops_rd_max=${this.iops_rd_max},`;
          if (this.iops_rd) device += `iops_rd=${this.iops_rd},`;
          if (this.iops_wr) device += `iops_wr=${this.iops_wr},`;
          if (this.iops_wr_max) device += `iops_wr_max=${this.iops_wr_max},`;
          if (this.mbps_wr) device += `mbps_wr=${this.mbps_wr},`;
          if (this.mbps_rd) device += `mbps_rd=${this.mbps_rd},`;
          if (this.mbps_rd_max) device += `mbps_rd_max=${this.mbps_rd_max},`;
          if (this.mbps_wr_max) device += `mbps_wr_max=${this.mbps_wr_max},`;
        }
        let param = {
          [/(unused)/.test(this.param.type)
            ? `scsi${this.deviceIndex}`
            : this.param.type]: device.slice(0, device.length - 1),
          digest: this.db.qemuConfigObj.digest,
        };
        this.updateHardWare(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      }
    },
    close() {
      this.$emit("close");
    },
    handleStorageSelect(value) {
      this.storage = value;
      this.storageType = this.db.storageList.filter(
        (it) => it.storage === value
      )[0].type;
      if (this.storageType === "dir") this.format = "qcow2";
      else this.format = "raw";
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty";
        return;
      }
      if (
        value &&
        ["iops_rd", "iops_wr", "iops_rd_max", "iops_wr_max"].includes(prop) &&
        Number(value) < 10
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Value cannot be less than 10";
        return;
      }
    },
    validateAll() {
      let props = [];
      if (this.modalType !== "edit") {
        this.isAdvice
          ? (props = [
            "deviceIndex",
            "disksize",
            "iops_rd",
            "iops_wr",
            "iops_rd_max",
            "iops_wr_max",
            "storage",
          ])
          : (props = ["deviceIndex", "disksize", "storage"]);
      } else if (this.modalType === "edit" && this.isAdvice) {
        props = ["iops_rd", "iops_wr", "iops_rd_max", "iops_wr_max"];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleCacheSelect(value) {
      this.cache = value;
    },
    handleFormatSelect(value) {
      this.format = value;
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
