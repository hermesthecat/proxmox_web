<template>
  <m-dialog :title="modalType === 'edit' ? 'Edit: CD/DVD Driver' : 'Add: CD/DVD Driver'
    " :visible="visible" v-if="visible" @confirm="confirm" @cancel="close" :_style="{
      width: '946px',
    }" @close="close">
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>Basic Information</dt>
          <dd>
            <m-input type="number" label="Bus" v-model="deviceIndex" labelWidth="100px" min="0" prop="deviceIndex"
              :_style="{ paddingLeft: '115px' }" @validate="validate" :error-msg="rules['deviceIndex'].message"
              :show-error="rules['deviceIndex'].error">
              <div slot="prefix" style="
                  display: inline-block;
                  position: absolute;
                  top: -16px;
                  left: -6px;
                  height: 100%;
                ">
                <div class="m-margin-top-10 m-form__select" style="width: 115px">
                  <select class="m-form__select_inner" v-model="device" style="width: 110px">
                    <template v-for="item of deviceList">
                      <option v-if="item.value !== 'virtio'" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </option>
                    </template>
                  </select>
                </div>
              </div>
            </m-input>
          </dd>
        </dl>

        <dl>
          <dt style="width: 100%">
            <label class="m-input__radio">
              <input type="radio" value="iso" name="mediaType" v-model="mediaType" />
              <div></div>
            </label>
            Use CD/DVD Disc Image (ISO)
          </dt>
          <dd>
            <dl>
              <dd>
                <m-select prop="storage" label="Storage" labelWidth="100px" @on-change="handleStorageSelect"
                  v-model="storage" validateEvent @validate="validate" :show-error="rules['storage'].error"
                  :error-msg="rules['storage'].message" :readonly="true" required :disabled="mediaType !== 'iso'"
                  placeholder="Please select storage">
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
                <m-select prop="image" label="Image" labelWidth="100px" @on-change="handleImageSelect" v-model="image"
                  validateEvent @validate="validate" :readonly="true" required :show-error="rules['image'].error"
                  :error-msg="rules['image'].message" :disabled="mediaType !== 'iso'" placeholder="Please select image">
                  <div class="table">
                    <m-option v-for="(item, index) in db.imageList" :key="item.volid" :value="item.volid"
                      :label="render_storage_content(null, null, item)">
                      <div v-if="index === 0" class="table-tr">
                        <div class="table-td">Name</div>
                        <div class="table-td">Format</div>
                        <div class="table-td">Size</div>
                      </div>
                      <div class="table-tr">
                        <div class="table-td" :title="render_storage_content(null, null, item) || ''">
                          {{ render_storage_content(null, null, item) }}
                        </div>
                        <div class="table-td" :title="item.format">
                          {{ item.format }}
                        </div>
                        <div class="table-td" :title="byteToSize(item.size)">
                          {{ byteToSize(item.size) }}
                        </div>
                      </div>
                    </m-option>
                  </div>
                </m-select>
              </dd>
            </dl>
          </dd>
        </dl>
      </div>

      <div class="m-form__section">
        <dl>
          <dt style="width: 100%">
            <label class="m-input__radio">
              <input type="radio" value="cdrom" name="mediaType" v-model="mediaType" />
              <div></div>
            </label>
            Use Physical CD/DVD Drive
          </dt>
        </dl>
      </div>

      <div class="m-form__section">
        <dl>
          <dt style="width: 100%">
            <label class="m-input__radio">
              <input type="radio" value="none" name="mediaType" v-model="mediaType" />
              <div></div>
            </label>
            Do Not Use Any Media
          </dt>
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
      cacheList: CACHELIST,
      deviceIndex: "1",
      mediaType: "iso",
      image: "",
      device: "ide",
      storage: "",
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
      let _this = this;
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        if (_this.modalType === "edit") {
          if (_this.param.type) {
            _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
            _this.device = _this.param.type.replace(/\d$/, "");
            _this.deviceIndex = _this.param.type.replace(/[A-Za-z]/g, "");
          }
        }
      });
      this.queryStorage({ format: 1, content: "iso" });
    },
    parseValue(value) {
      let values = value.split(",");
      if (values) {
        for (let i in values) {
          if (/(\.iso)$/.test(values[i])) {
            this.mediaType = "iso";
            this.image = values[i];
            this.storage = values[i].split(":")[0];
          } else if (values[i] !== "media=cdrom") {
            this.mediaType = values[i];
          }
        }
      }
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        [`${this.device}${this.deviceIndex}`]: `${this.mediaType === "iso" ? `${this.image}` : this.mediaType
          },media=cdrom`,
        digest: this.db.qemuConfigObj.digest,
        background_delay: 5,
      };
      if (this.mediaType !== "edit") {
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
      this.queryImage({ content: "iso" });
    },
    handleImageSelect(value) {
      this.image = value;
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && this.mediaType === "iso") {
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
      this.mediaType === "iso"
        ? (props = ["storage", "image", "deviceIndex"])
        : (props = ["deviceIndex"]);
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
