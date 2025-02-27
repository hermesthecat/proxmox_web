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
              :_style="{ paddingLeft: '115px' }" @validate="validate" required :error-msg="rules['deviceIndex'].message"
              :show-error="rules['deviceIndex'].error">
              <div slot="prefix" style="
                  display: inline-block;
                  position: absolute;
                  top: -16px;
                  left: -6px;
                  height: 100%;
                ">
                <div class="m-margin-top-10 m-form__select" style="width: 115px">
                  <select class="m-form__select_inner" v-model="device" style="width: 110px"
                    @change="setDefaultDeviceIndex">
                    <template v-for="item of deviceList">
                      <option v-if="item.value !== 'virtio'" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </option>
                    </template>
                  </select>
                </div>
              </div>
            </m-input>
            <m-select prop="storage" label="Storage" labelWidth="100px" @on-change="handleStorageSelect"
              v-model="storage" validateEvent @validate="validate" required :show-error="rules['storage'].error"
              :error-msg="rules['storage'].message" :readonly="true" placeholder="Please select storage">
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
              :readonly="false" :disabled="!storageType || storageType !== 'dir'" placeholder="Please select format">
              <m-option v-for="(item, index) in formatList" :key="index" :value="item.value" :label="item.label">
              </m-option>
            </m-select>
          </dd>
        </dl>
      </div>
    </div>
    <template slot="footer">
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px"
        @on-click="confirm()">Confirm</m-button>
    </template>
  </m-dialog>
</template>

<script>
import { DEVICELIST, CACHELIST } from "@libs/enum/enum";
import { byteToSize, render_storage_content } from "@libs/utils/index";
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
      format: "raw",
      deviceIndex: "1",
      image: "",
      device: "ide",
      storage: "",
      storageType: "",
      usedIDList: [],
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
        image: {
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
    render_storage_content,
    byteToSize,
    __init__() {
      //Find used IDs
      this.usedIDList = Object.keys(this.db.qemuConfigObj)
        .filter((it) => {
          let regx = new RegExp(`\^\(${this.device}\)\\d\$`, "g");
          return regx.test(it);
        })
        .map((item) => {
          let regx = new RegExp(`\^\(${this.device}\)\(\\d\)\$`, "g");
          return Number(item.replace(regx, "$2"));
        });
      //Set default ID
      this.deviceIndex =
        this.usedIDList && this.usedIDList.length > 0
          ? Math.max(...this.usedIDList) + 1
          : 0;
      this.queryConfig({ _dc: new Date().getTime() });
      //Query storage
      this.queryStorage({ format: 1, content: "images" });
    },
    confirm() {
      if (this.validateAll()) return;
      let device = "";
      if (this.storage) {
        device += `${this.storage}:cloudinit,`;
      }
      if (this.format) {
        device += `format=${this.format},`;
      }
      let param = {
        [`${this.device}${this.deviceIndex}`]: device.replace(/(\,)$/, ""),
        digest: this.db.qemuConfigObj.digest,
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
    handleFormatSelect(value) {
      this.format = value;
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
      if (value && this.usedIDList.includes(this.deviceIndex)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "This ID is already in use";
        return;
      }
    },
    validateAll() {
      let props = ["deviceIndex", "storage"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleFormatSelect(value) {
      this.format = value;
    },
    setDefaultDeviceIndex() {
      debugger;

      this.usedIDList = Object.keys(this.db.qemuConfigObj)
        .filter((it) => {
          let regx = new RegExp(`\^\(${this.device}\)\\d\$`, "g");
          return regx.test(it);
        })
        .map((item) => {
          let regx = new RegExp(`\^\(${this.device}\)\(\\d\)\$`, "g");
          return Number(item.replace(regx, "$2"));
        });
      this.deviceIndex =
        this.usedIDList && this.usedIDList.length > 0
          ? Math.max(...this.usedIDList) + 1
          : 0;
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
