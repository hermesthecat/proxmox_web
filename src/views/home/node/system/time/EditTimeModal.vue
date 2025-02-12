<template>
  <Dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-select prop="timeZone" label="Time Zone" labelWidth="100px" :readonly="false" v-model="timezone"
                @on-change="handleTimeZoneSelect" placeholder="Please select time zone">
                <m-option v-for="item in timeZoneOptions" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeSystemTimeHttp from "@src/views/home/node/system/time/http";
import { timeZone } from "@libs/enum/enum";
export default {
  name: "EditTimeModal",
  mixins: [NodeSystemTimeHttp],
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
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      timeZoneOptions: timeZone,
      timezone: "",
      rules: {
        timezone: {
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
    create() {
      if (this.validateAll()) return;
    },
    __init__() {
      let _this = this;
      Object.keys(_this.param).forEach((key) => {
        _this[key] = _this.param[key];
      });
    },
    close() {
      this.$emit("close");
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
      let props = [];
      props = ["timezone"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleTimeZoneSelect(value) {
      this.timezone = value;
    },
    confirm() {
      if (this.validateAll()) return;
      let params = {
        timezone: this.timezone,
      };
      this.updateTimeZone(params)
        .then((res) => {
          this.close();
        })
        .catch((res) => {
          this.$confirm.error({
            msg: res,
          });
        });
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

.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
