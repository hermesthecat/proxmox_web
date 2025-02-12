<template>
  <Dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-select prop="device" label="Disk" labelWidth="100px" @on-change="handleDestSelect" v-model="device"
                validateEvent @validate="validate" :error-msg="rules['device'].message"
                :show-error="rules['device'].error" :readonly="true" placeholder="Please select disk">
                <m-option v-for="(item, index) in db.nodeDiskList" :key="item.devpath" :label="item.devpath"
                  :value="item.devpath">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Device</span>
                        <span class="table-td">Size</span>
                        <span class="table-td">Serial</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.devpath">{{
                        item.devpath
                      }}</span>
                      <span class="table-td" :title="(item.size && byteToSize(item.size)) || 0">{{ (item.size &&
                        byteToSize(item.size)) || 0
                        }}</span>
                      <span class="table-td" :title="item.serial">{{
                        item.serial
                      }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select prop="filesystem" label="File System" labelWidth="100px" @on-change="handleFsSelect"
                v-model="filesystem" validateEvent @validate="validate" :error-msg="rules['filesystem'].message"
                :show-error="rules['filesystem'].error" :readonly="false" placeholder="Please select disk">
                <m-option key="ext4" label="ext4" value="ext4"> </m-option>
                <m-option key="xfs" label="xfs" value="xfs"> </m-option>
              </m-select>
              <m-input type="text" prop="name" label="Name" labelWidth="100px" v-model="name" validateEvent
                @validate="validate" :error-msg="rules['name'].message" :show-error="rules['name'].error"
                :placeholder="'Please enter name'" />
              <m-checkbox label="Add Storage" v-model="add_storage" labelWidth="100px"></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="confirm">Create</m-button>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeDiskDirectoryHttp from "@src/views/home/node/disk/directory/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateDirectoryModal",
  mixins: [NodeDiskDirectoryHttp],
  components: {
    Dialog,
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
  },
  data() {
    return {
      device: "",
      name: "",
      add_storage: true,
      filesystem: "",
      rules: {
        name: {
          error: false,
          message: "",
        },
        device: {
          error: false,
          message: "",
        },
        filesystem: {
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
    //Request disk
    async __init__() {
      let _this = this;
      this.queryListNodeDiskList({ type: "unused" });
    },
    //Select disk
    handleDestSelect(value) {
      this.device = value;
    },
    //Close dialog
    close() {
      this.$emit("close");
    },
    //Validate form
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
    //Validate all form fields
    validateAll() {
      let props = ["name", "device", "filesystem"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //Select file system
    handleFsSelect(value) {
      this.filesystem = value;
    },
    //Confirm add
    confirm() {
      if (this.validateAll()) return;
      let param = {
        name: this.name,
        add_storage: this.add_storage ? 1 : 0,
        device: this.device,
        filesystem: this.filesystem,
      };

      this.createDirectory(param)
        .then((res) => {
          this.close();
        })
        .catch((res) => {
          this.$confirm
            .info({
              msg: res,
            })
            .then(() => this.close());
        });
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
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
