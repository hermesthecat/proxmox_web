<template>
  <m-dialog title="Add USB Device" :visible="visible" v-if="visible" @confirm="confirm" @cancel="close" :_style="{
    width: '600px',
  }" @close="close">
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt style="width: 100%">
            <label class="m-input__radio">
              <input type="radio" value="spice" name="type" v-model="type" />
              <div></div>
            </label>
            Spice Port
          </dt>
        </dl>
      </div>

      <div class="m-form__section">
        <dl>
          <dt style="width: 100%">
            <label class="m-input__radio">
              <input type="radio" value="device" name="type" v-model="type" />
              <div></div>
            </label>
            Use USB Vendor/Device ID
          </dt>
          <dt>
            <m-select prop="device" label="Select Device" labelWidth="100px" @on-change="handleDeviceSelect"
              v-model="device" validateEvent @validate="validate" :readonly="true" required
              :show-error="rules['device'].error" :error-msg="rules['device'].message" :disabled="type !== 'device'"
              placeholder="Please select device">
              <div class="table">
                <m-option v-for="(item, index) in usbList" :key="item.vendid + ':' + item.prodid"
                  :value="item.vendid + ':' + item.prodid" :label="item.product + '(' + item.vendid + ':' + item.prodid + ')'
                    ">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Device</div>
                    <div class="table-td">Manufacturer</div>
                    <div class="table-td">Product</div>
                    <div class="table-td">Speed</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.vendid + ':' + item.prodid">
                      {{ item.vendid + ":" + item.prodid }}
                    </div>
                    <div class="table-td" :title="item.manufacturer">
                      {{ item.manufacturer }}
                    </div>
                    <div class="table-td" :title="item.product">
                      {{ item.product }}
                    </div>
                    <div class="table-td" :title="renderSpeed(item.speed)">
                      {{ renderSpeed(item.speed) }}
                    </div>
                  </div>
                </m-option>
              </div>
            </m-select>
          </dt>
        </dl>
      </div>

      <div class="m-form__section">
        <dl>
          <dt style="width: 100%">
            <label class="m-input__radio">
              <input type="radio" value="port" name="type" v-model="type" />
              <div></div>
            </label>
            Use USB Port
          </dt>
          <dt>
            <m-select prop="port" label="Select Port" labelWidth="100px" @on-change="handlePortSelect" v-model="port"
              validateEvent @validate="validate" required :show-error="rules['port'].error"
              :error-msg="rules['port'].message" :readonly="true" :disabled="type !== 'port'"
              placeholder="Please select port">
              <div class="table">
                <m-option v-for="(item, index) in usbList" :key="item.busnum + '-' + item.usbpath"
                  :value="item.busnum + '-' + item.usbpath" :label="item.product + '(' + item.busnum + '-' + item.usbpath + ')'
                    ">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Port</div>
                    <div class="table-td">Manufacturer</div>
                    <div class="table-td">Product</div>
                    <div class="table-td">Speed</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.busnum + '-' + item.usbpath">
                      {{ item.busnum + "-" + item.usbpath }}
                    </div>
                    <div class="table-td" :title="item.manufacturer">
                      {{ item.manufacturer }}
                    </div>
                    <div class="table-td" :title="item.product">
                      {{ item.product }}
                    </div>
                    <div class="table-td" :title="renderSpeed(item.speed)">
                      {{ renderSpeed(item.speed) }}
                    </div>
                  </div>
                </m-option>
              </div>
            </m-select>
          </dt>
        </dl>
        <m-checkbox label="Use USB 3" v-model="usb3" labelWidth="100px"></m-checkbox>
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
      type: "spice",
      usbList: [],
      device: "",
      port: "",
      usb3: true,
      rules: {
        port: {
          error: false,
          message: "",
        },
        device: {
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
      await this.queryUsb().then((res) => {
        this.usbList = this.db.usbList.filter(
          (item) => !!item.usbpath && !!item.prodid && item["class"] != 9
        );
      });
      await this.queryConfig({ _dc: new Date().getTime() }).then(() => {
        if (_this.modalType === "edit") {
          if (_this.param.type) {
            _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
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
            _this.type = values[i];
          } else if (values[i].split("=")[1].indexOf(":") >= 0) {
            _this.type = "device";
            _this.device = values[i].split("=")[1];
          } else if (values[i].split("=")[1].indexOf("-") >= 0) {
            _this.type = "port";
            _this.port = values[i].split("=")[1];
          } else if (values[i].split("=")[0] === "usb3") {
            _this[values[i].split("=")[0]] =
              values[i].split("=")[1] === "1" ? true : false;
          } else {
            _this[values[i].split("=")[0]] = values[i].split("=")[1];
          }
        }
      }
    },
    renderSpeed(value) {
      let speed_map = {
        10000: "USB 3.1",
        5000: "USB 3.0",
        480: "USB 2.0",
        12: "USB 1.x",
        1.5: "USB 1.x",
      };
      return speed_map[value] || value + " Mbps";
    },
    confirm() {
      if (this.validateAll()) return;
      let usb = "";
      if (this.type === "spice") usb += "spice,";
      if (this.type === "device") usb += `host=${this.device},`;
      if (this.type === "port") usb += `host=${this.port},`;
      if (this.usb3) usb += "usb3=1,";
      if (this.modalType !== "edit") {
        let usbId = Object.keys(this.db.qemuConfigObj)
          .filter((it) => {
            return /^(usb)\d$/.test(it);
          })
          .map((item) => {
            return Number(item.replace(/^(usb)(\d)$/g, "$2"));
          });
        let id = usbId && usbId.length > 0 ? Math.max(...usbId) + 1 : 0;
        let param = {
          [`usb${id}`]: usb.replace(/(\,)$/, ""),
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
          [this.param.type]: usb.replace(/(\,)$/, ""),
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
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (this.type == "device" && prop === "device") {
        if (/^\s*$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Cannot be empty";
          return;
        }
      }
      if (this.type === "port" && prop === "port") {
        if (/^\s*$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Cannot be empty";
          return;
        }
      }
    },
    validateAll() {
      let props = [];
      if (this.type === "device") props = ["device"];
      if (this.type === "port") props = ["port"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleDeviceSelect(value) {
      this.device = value;
    },
    handlePortSelect(value) {
      this.port = value;
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
