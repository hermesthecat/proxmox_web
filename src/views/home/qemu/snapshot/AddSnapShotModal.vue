<template>
  <m-dialog :visible="visible" @cancel="close()" @confirm="confirm()" :title="title"
    :confirmText="isCreate ? 'Take Snapshot' : 'Edit Snapshot'" :_style="{ width: '956px' }" @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-input type="text" prop="name" label="Name" labelWidth="100px" min="100" validateEvent
                @validate="validate" :show-error="rules.name.error" :error-msg="rules.name.message" v-model="name"
                required :disabled="!isCreate" placeholder="Please enter name" />
              <m-checkbox label="Include Memory" v-model="vmstate" v-show="isCreate" labelWidth="100px"
                v-if="node && node.type !== 'lxc'"></m-checkbox>
              <m-input type="text" prop="snaptime" label="Timestamp" labelWidth="100px" v-model="snaptime"
                :disabled="!isCreate" v-show="!isCreate" :__conStyle="{
                  width: '250px',
                }" placeholder="Please enter name" />
              <m-input type="textarea" prop="description" labelWidth="100px" label="Description" v-model="description"
                placeholder="Please enter description" />
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-show="!isCreate">
          <dl>
            <dt>Configuration Information</dt>
            <dd>
              <el-table :data="qemuObjList">
                <el-table-column label="key" prop="key"></el-table-column>
                <el-table-column label="value" prop="value"></el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
      </div>
      <m-dialog :visible="showDeleteLog" @close="closeDeleteLog" title="Progress">
        <template slot="content">
          <div class="progress" v-if="!done">
            <div class="progress-inner"></div>
          </div>
          <div v-else>
            <div class="progress">Done!</div>
          </div>
        </template>
        <template slot="footer"><span></span></template>
      </m-dialog>
    </div>
  </m-dialog>
</template>

<script>
import SnapShotHttp from "@src/views/home/qemu/snapshot/http";
import { formatDateForWeek } from "@libs/utils/index";
export default {
  name: "AddSnapShotModal",
  mixins: [SnapShotHttp],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    isCreate: {
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
  data() {
    return {
      name: "",
      vmstate: false,
      description: "",
      interVal: null,
      showDeleteLog: false, //Show progress
      done: true,
      snaptime: "",
      qemuObjList: [],
      rules: {
        name: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__(); //Call initialization operation
  },
  methods: {
    formatDateForWeek,
    __init__() {
      let _this = this;
      if (!_this.isCreate) {
        _this
          .queryVmConfig({ _dc: new Date().getTime() }, _this.param.name)
          .then((res) => {
            _this.qemuObjList = Object.keys(_this.db.qemuObj).map((key) => {
              return {
                key,
                value: _this.db.qemuObj[key],
              };
            });
          });
        if (_this.param) {
          Object.keys(_this.param).forEach((key) => {
            if (
              Object.prototype.toString.call(_this[key]) ===
              "[object Undefined]"
            )
              return;
            if (key === "vmstate")
              _this.vmstate = _this.param[key] === 1 ? true : false;
            else if (key === "snaptime")
              _this.snaptime = formatDateForWeek(
                _this.param.snaptime * 1000,
                "w dd MM月 yyyy hh:mm:ss"
              );
            else _this[key] = _this.param[key];
          });
        }
      }
    },
    /**
     * Validation
     * @param prop Field to validate
     */
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty!";
        return;
      }
    },
    validateAll() {
      this.validate("name");
      return this.rules["name"].error === true;
    },
    /**
     * Confirm
     */
    confirm() {
      if (this.validateAll()) return;
      if (!this.isCreate) {
        let param = {
          snapname: this.name,
          description: this.description,
        };
        this.updateSnapShot(param.snapname, param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .confirm({
                msg: res,
              })
              .then((res) => {
                this.close();
              });
          });
      }
      if (this.isCreate) {
        let param = {
          snapname: this.name,
          vmstate: this.vmstate ? 1 : 0,
          description: this.description,
        };
        if (this.node.type === "lxc") delete param.vmstate;
        this.addSnapShot(param).catch((res) => {
          this.$confirm
            .confirm({
              msg: res,
            })
            .then((res) => {
              this.close();
            });
        });
      }
    },
    /**
     * Close modal
     */
    close() {
      this.$emit("close");
    },
    closeDeleteLog() {
      this.showDeleteLog = false;
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.close();
    },
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
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
.progress {
  width: 90%;
  position: relative;
  height: 30px;
  line-height: 30px;
  background: #f5f5f5;
  padding: 0px 10px;
  margin: 90px 0px;
  text-align: center;

  &-inner {
    position: absolute;
    height: 30px;
    line-height: 30px;
    animation: progress 3s infinite;
    background: #369;
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }

  25% {
    width: 25%;
  }

  50% {
    width: 50%;
  }

  75% {
    width: 75%;
  }

  100% {
    width: 100%;
  }
}
</style>
