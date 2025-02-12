<template>
  <m-dialog title="Add PCI Device" :visible="visible" v-if="visible" @confirm="confirm" @cancel="close" :_style="{
    width: '946px',
  }" @close="close">
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>Basic Information</dt>
          <dd>
            <m-select prop="host" label="Device" labelWidth="100px" @on-change="handleHostSelect" v-model="host"
              validateEvent @validate="validate" required :show-error="rules['host'].error"
              :error-msg="rules['host'].message" :readonly="true" placeholder="Please select device">
              <div class="table">
                <m-option v-for="(item, index) in db.pciList" :key="item.id" :value="item.id" :label="item.id">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">ID</div>
                    <div class="table-td">IOMMU Group</div>
                    <div class="table-td">Vendor</div>
                    <div class="table-td">Device</div>
                    <div class="table-td">Mediated Device</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.id">{{ item.id }}</div>
                    <div class="table-td" :title="item.immugroup">
                      {{ item.immugroup }}
                    </div>
                    <div class="table-td" :title="item.subsystem_vendor_name">
                      {{ item.subsystem_vendor_name }}
                    </div>
                    <div class="table-td" :title="item.device_name">
                      {{ item.device_name }}
                    </div>
                    <div class="table-td" :title="item.mdev ? 'No' : 'Yes'">
                      {{ item.mdev ? "No" : "Yes" }}
                    </div>
                  </div>
                </m-option>
              </div>
            </m-select>
            <m-select prop="mdev" label="MDev Type" labelWidth="100px" @on-change="handleModelSelect" v-model="mdev"
              :readonly="true" :disabled="mdevDisabled" placeholder="Please select type">
              <div class="table">
                <m-option v-for="(item, index) in db.pciMDevList" :key="index" :value="item.type" :label="item.type">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Type</div>
                    <div class="table-td">Available</div>
                    <div class="table-td">Description</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.type">
                      {{ item.type }}
                    </div>
                    <div class="table-td" :title="item.available">
                      {{ item.available }}
                    </div>
                    <div class="table-td" :title="item.description">
                      {{ item.description }}
                    </div>
                  </div>
                </m-option>
              </div>
            </m-select>
            <m-checkbox label="All Functions" v-model="multifunction" labelWidth="100px"></m-checkbox>
            <m-checkbox label="Primary GPU" v-model="xvga" labelWidth="100px"></m-checkbox>
            <div class="m-form__section"></div>
          </dd>
        </dl>
      </div>
      <div class="m-form__section" v-if="isAdvice">
        <dl>
          <dt>Advanced</dt>
          <dd>
            <m-checkbox label="ROM-Bar" v-model="rombar" labelWidth="100px"></m-checkbox>
            <m-checkbox label="PCI-Express" v-model="pcie" :disabled="!mdev" labelWidth="100px">Q35 Only</m-checkbox>
          </dd>
        </dl>
      </div>
    </div>
    <template slot="footer">
      <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>Advanced</div>
        </label>
      </div>
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px"
        @on-click="confirm()">Confirm</m-button>
    </template>
  </m-dialog>
</template>

<script>
import { DEVICELIST, CACHELIST, MODELLIST } from "@libs/enum/enum";
import { byteToSize, macPrefix } from "@libs/utils/index";
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
      host: "",
      mdev: "",
      xvga: false,
      multifunction: false,
      rombar: false,
      pcie: false,
      isAdvice: false,
      mdevDisabled: true,
      rules: {
        host: {
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
    async __init__() {
      let _this = this;
      await this.queryPci();
      this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        if (_this.modalType === "edit") {
          if (_this.param.type) {
            _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
            ["rombar", "pcie"].forEach((item) => {
              _this.db.qemuConfigObj[_this.param.type].indexOf(item) >= 0;
              _this.isAdvice = true;
            });
          }
        }
      });
    },
    //Parse value
    parseValue(value) {
      let values = value.split(","),
        _this = this;
      if (values) {
        for (let i in values) {
          if (values[i].indexOf("=") < 0) {
            _this.db.pciList.forEach((item) => {
              if (item.id.indexOf(values[i]) >= 0) {
                _this.host = item.id;
              }
            });
          } else if (
            ["rombar", "pcie", "x-vga", "multifunction"].includes(
              values[i].split("=")[0]
            )
          ) {
            _this[values[i].split("=")[0].replace(/-/, "")] =
              values[i].split("=")[1] === "1" ? true : false;
          } else {
            _this[values[i].split("=")[0]] = values[i].split("=")[1];
          }
        }
      }
    },
    confirm() {
      if (this.validateAll()) return;
      let hostpci = "",
        host = this.host;
      if (this.host.substring(0, 5) === "0000:") {
        host = host.substring(5);
      }
      if (this.multifunction) {
        // modify host to skip the '.X'
        host = host.substring(0, this.host.indexOf("."));
      }
      if (host) hostpci += `${host},`;
      hostpci += `rombar=${this.rombar ? 1 : 0},`;
      hostpci += `x-vga=${this.xvga ? 1 : 0},`;
      if (this.pcie) hostpci += `pcie=${this.pcie ? 1 : 0},`;
      if (this.modalType !== "edit") {
        let netId = Object.keys(this.db.qemuConfigObj)
          .filter((it) => {
            return /^(hostpci)\d$/.test(it);
          })
          .map((item) => {
            return Number(item.replace(/^(hostpci)(\d)$/g, "$2"));
          });
        let id = netId && netId.length > 0 ? Math.max(...netId) + 1 : 0;
        let param = {
          [`hostpci${id}`]: hostpci.replace(/\,$/, ""),
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
      } else {
        let param = {
          [this.param.type]: hostpci.replace(/\,$/, ""),
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
    handleModelSelect(value) {
      this.model = value;
    },
    handleHostSelect(value) {
      if (!value) {
        return;
      }
      this.host = value;
      let pcidev = this.db.pciList.filter((item) => item.id === value)[0];
      this.mdevDisabled = !pcidev || !pcidev.mdev;
      if (!pcidev) {
        return;
      }
      let id = pcidev.id.substring(0, 5); // 00:00
      let iommu = pcidev.iommugroup;
      if (pcidev.mdev) {
        this.queryMDev();
      }
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
      let props = ["host"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
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
