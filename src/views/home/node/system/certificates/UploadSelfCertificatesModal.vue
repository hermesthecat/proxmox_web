<template>
  <Dialog :visible="visible" @cancel="close" :title="title" :_style="{ width: '956px' }" @close="$emit('close')">
    <div slot="content" style="max-height: 500px" v-if="isCreate">
      <div class="m-form__content">
        <div class="m-form__section">
          <m-input type="textarea" label="Private Key" v-model="key" validateEvent @validate="validate" prop="key"
            :show-error="rules['key'].error" :error-msg="rules['key'].message" :_style="{ width: '100%' }"
            style="width: 100%; padding-left: 0px" rows="5" :__conStyle="{ width: '100%' }" />
          <m-button type="primary" icon="el-icon-upload" style="position: relative">Upload from file
            <input type="file" class="upload" value="Please select file" ref="key" @change="uplodFile('key')" />
          </m-button>
        </div>
      </div>
      <div class="m-form__content">
        <div class="m-form__section">
          <m-input type="textarea" label="Certificate Chain" :_style="{ width: '100%' }" v-model="certificates"
            validateEvent @validate="validate" prop="certificates" :show-error="rules['certificates'].error"
            :error-msg="rules['certificates'].message" style="width: 100%; padding-left: 0px" rows="5"
            :__conStyle="{ width: '100%' }" />
          <m-button type="primary" style="position: relative" icon="el-icon-upload">Upload from file<input type="file"
              class="upload" value="Please select file" ref="certificates"
              @change="uplodFile('certificates')" /></m-button>
        </div>
      </div>
    </div>
    <div slot="content" style="max-height: 500px" v-if="!isCreate">
      <div class="watch-table">
        <div class="watch-tr" v-for="(item, key) of param" :key="key">
          <template v-if="key === 'san'">
            <div class="watch-key">{{ $t(`certificates.${key}`) }}</div>
            <div class="watch-value">
              <p v-for="(it, index) in item" :key="index">{{ it }}</p>
            </div>
          </template>
          <template v-else>
            <div class="watch-key">{{ $t(`certificates.${key}`) }}</div>
            <div class="watch-value">
              {{
                ["notbefore", "notafter"].includes(key)
                  ? dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm")
                  : item
              }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <template slot="footer">
      <template>
        <m-button class="create-btn" type="primary" @on-click="create" v-if="isCreate">Upload</m-button>
        <m-button class="create-btn" type="primary" @on-click="close" v-if="!isCreate">Cancel</m-button>
      </template>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import { dateFormat } from "@libs/utils/index";
import CertificatesHttp from "@src/views/home/node/system/certificates/http";
import { uplodFile } from "@libs/utils/index";
export default {
  name: "CreateReplicationModal",
  mixins: [CertificatesHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    iftype: {
      type: String,
      default: "",
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
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      key: "",
      certificates: "",
      rules: {
        certificates: {
          error: false,
          message: "",
        },
        key: {
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
    dateFormat,
    create() {
      if (this.validateAll()) return;
      let param = {
        key: this.key,
        certificates: this.certificates,
      };
      this.createCertificates(param)
        .then(() => this.close())
        .catch((res) =>
          this.$confirm.error({
            msg: res,
            icon: "icon-warning",
          })
        );
    },
    async __init__() {
      let _this = this;
    },
    //Upload file
    uplodFile(key) {
      let file = this.$refs[key].files[0];
      uplodFile(file, (val) => {
        this[key] = val;
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
      //Validate custom certificate
      if (value && prop === "certificates") {
        if (
          !/^((\-){5}(BEGIN CERTIFICATE)(\-){5})([\s\S]*)((\-){5}(END CERTIFICATE)(\-){5})$/.test(
            value
          )
        ) {
          this.rules[prop].error = true;
          this.rules[prop].message =
            "Certificate must start with -----BEGIN CERTIFICATE----- and end with -----END CERTIFICATE-----";
          return;
        }
      }
      if (value && prop === "key") {
        if (
          !/^((\-){5}(BEGIN RSA PRIVATE KEY)(\-){5})([\s\S]*)((\-){5}(END RSA PRIVATE KEY)(\-){5})$/.test(
            value
          )
        ) {
          this.rules[prop].error = true;
          this.rules[prop].message =
            "Private key must start with -----BEGIN RSA PRIVATE KEY----- and end with -----END RSA PRIVATE KEY-----";
          return;
        }
      }
    },
    validateAll() {
      let props = [];
      props = ["key", "certificates"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
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
.watch {
  &-table {
    display: table;
    width: 100%;
    padding: 20px;
  }

  &-tr {
    display: table-row;
    height: 35px;
    line-height: 35px;

    &:nth-child(2n) {
      background: #dde4ed;
    }
  }

  &-key,
  &-value {
    display: table-cell;
    width: 50%;
  }
}

.checkbox {
  margin-bottom: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
}

.m-button {
  height: 33px;
  line-height: 28px;
}

.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}

.upload {
  z-index: 0;
  opacity: 0;
  width: 100%;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  position: absolute;
  height: 100%;
}
</style>
