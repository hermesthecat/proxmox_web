<template>
  <m-dialog title="Add Disk" :visible="visible" v-if="visible" @confirm="confirm" @cancel="close" :_style="{
    width: '946px',
  }" @close="close">
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>Basic Information</dt>
          <dd>
            <m-select prop="storage" label="Storage" labelWidth="100px" @on-change="handleStorageSelect"
              v-model="storage" validateEvent @validate="validate" :readonly="true" placeholder="Please select storage">
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
            <p class="warning">
              Warning: The virtual machine is not currently using "OVMF (UEFI)" as BIOS.
            </p>
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
import { byteToSize } from "@libs/utils/index";
import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
  name: "AddOrEditEfiModal",
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
      format: "qcow2",
      storage: "",
      storageType: "",
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
    __init__() {
      this.queryConfig({ _dc: new Date().getTime() });
      this.queryStorage({ format: 1, content: "images" });
    },
    confirm() {
      if (this.validateAll()) return;
      let device = "";
      if (this.storage) device += `${this.storage}:1,`;
      if (this.format && this.storageType === "dir")
        device += `format=${this.format},`;
      let param = {
        [`efidisk0`]: device.slice(0, device.length - 1),
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
    validate() { },
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
    },
    validateAll() {
      let props = ["storage"];
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
