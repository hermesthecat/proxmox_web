<template>
  <m-dialog :visible="visible" @close="close" @cancel="close" title="Change Password" @confirm="confirm">
    <template slot="content">
      <div class="modify-form">
        <m-input label="Password" labelWidth="100px" v-model="password" prop="password" type="password" validateEvent
          @validate="validate" :show-error="rules['password'].error" placeholder="Please enter password"
          :error-msg="rules['password'].message" />
        <m-input label="Confirm Password" labelWidth="100px" v-model="confirmPsw" type="password" prop="confirmPsw"
          validateEvent @validate="validate" placeholder="Please confirm password"
          :show-error="rules['confirmPsw'].error" :error-msg="rules['confirmPsw'].message" />
      </div>
    </template>
  </m-dialog>
</template>

<script>
import HeaderHttp from "./Http";
export default {
  name: "ModifyPswModal",
  mixins: [HeaderHttp],
  /**
   * Props passed from parent component
   */
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      password: "",
      confirmPsw: "",
      rules: {
        password: {
          message: "",
          error: false,
        },
        confirmPsw: {
          message: "",
          error: false,
        },
      },
    };
  },
  methods: {
    /**
     * Single field validation
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
      if (value && prop === "confirmPsw" && this.password) {
        if (value !== this.password) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Passwords do not match!";
          return;
        }
      }
    },
    /**
     * Validate all fields
     */
    validateAll() {
      let props = ["password", "confirmPsw"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    /**
     * Close dialog
     */
    close() {
      this.$emit("close");
    },
    /**
     * Confirm changes
     */
    confirm() {
      if (this.validateAll()) return;
      // Get data center name
      let ticket = window.localStorage.getItem("ticket") || "{}",
        tic = JSON.parse(ticket);
      let param = {
        password: this.password,
        userid: tic.username,
      };
      this.updatePsw(param)
        .then((res) => {
          this.close();
        })
        .catch((res) => {
          this.$confirm.error({
            msg: res,
            icon: "icon-warning",
          });
        });
    },
  },
};
</script>

<style lang="less" scoped>
.modify-form {
  margin: 0 auto;
  width: 325px;
  margin-top: 20px;
}
</style>
