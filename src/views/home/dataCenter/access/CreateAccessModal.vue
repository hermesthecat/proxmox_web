<template>
  <Dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-select prop="path" label="Path" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.path.error" :error-msg="rules.path.message" :readonly="false"
                @on-change="handlePathSelect" v-model="path" placeholder="Please select path">
                <m-option v-for="item in db.resources" :key="item.id" :label="item.id" :value="item.id">
                </m-option>
              </m-select>
              <m-select prop="groups" label="Group" labelWidth="100px" @on-change="handleGroupSelect" v-model="groups"
                validateEvent @validate="validate" :show-error="rules.groups.error" :error-msg="rules.groups.message"
                v-if="modalType === 'group'" :readonly="false" placeholder="Please select group">
                <m-option v-for="(item, index) in db.groupsList" :key="item.groupid" :label="item.groupid"
                  :value="item.groupid">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Group</span>
                        <span class="table-td">Comment</span>
                        <span class="table-td">Users</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.groupid">{{
                        item.groupid
                      }}</span>
                      <span class="table-td" :title="item.comment">{{
                        item.comment
                      }}</span>
                      <span class="table-td" :title="item.users">
                        {{ item.users }}
                      </span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select prop="users" label="User" labelWidth="100px" @on-change="handleGroupSelect" v-model="users"
                validateEvent @validate="validate" :show-error="rules.users.error" :error-msg="rules.users.message"
                :readonly="false" v-if="modalType === 'user'" placeholder="Please select user">
                <m-option v-for="(item, index) in db.usersList" :key="item.userid" :label="item.userid"
                  :value="item.userid">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">User</span>
                        <span class="table-td">Name</span>
                        <span class="table-td">Comment</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.userid">{{
                        item.userid
                      }}</span>
                      <span class="table-td" :title="`${item.firstname ? item.firstname : ''} ${item.lastname ? item.lastname : ''
                        }`">{{
                          `${item.firstname ? item.firstname : ""} ${item.lastname ? item.lastname : ""
                          }`
                        }}</span>
                      <span class="table-td" :title="item.comment">
                        {{ item.comment }}
                      </span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select prop="tokens" label="Api Token" labelWidth="100px" @on-change="handleGroupSelect"
                v-model="tokens" validateEvent @validate="validate" :show-error="rules.tokens.error"
                :error-msg="rules.tokens.message" :readonly="false" v-if="modalType === 'apiToken'"
                placeholder="Please select Api Token">
                <m-option v-for="(item, index) in tokenList" :key="item.tokenid" :label="item.tokenid"
                  :value="item.tokenid">
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">Api Token</span>
                        <span class="table-td">Comment</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.tokenid">{{
                        item.tokenid
                      }}</span>
                      <span class="table-td" :title="item.comment">{{
                        item.comment
                      }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select prop="roles" label="Role" labelWidth="100px" @on-change="handleRoleSelect" v-model="roles"
                placeholder="Please select role">
                <m-option v-for="item in db.rolesList" :key="item.roleid" :label="item.roleid" :value="item.roleid">
                </m-option>
              </m-select>
              <m-checkbox label="Propagate" v-model="propagate" labelWidth="100px"></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import DataCenterAccessHttp from "@src/views/home/dataCenter/access/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateAccessModal",
  mixins: [DataCenterAccessHttp],
  components: {
    Dialog,
  },
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
      path: "",
      groups: "",
      roles: "NoAccess",
      propagate: true,
      tokenList: [],
      users: "",
      tokens: "",
      rules: {
        path: {
          error: false,
          message: "",
        },
        groups: {
          error: false,
          message: "",
        },
        users: {
          error: false,
          message: "",
        },
        tokens: {
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
    percentToFixed,
    byteToSize,
    async __init__() {
      if (this.modalType === "group") await this.queryGroupsList();
      await this.queryRoleList();
      if (this.modalType === "user") await this.queryUsersList({ enabled: 1 });
      if (this.modalType === "apiToken")
        await this.queryUsersList({ full: 1 }).then(() => {
          this.db.usersList.forEach((item) => {
            if (item.tokens) {
              this.tokenList.concat(item.tokens);
            }
          });
        });
    },
    handlePathSelect(value) {
      this.path = value;
    },
    handleGroupSelect(value) {
      switch (this.modalType) {
        case "user":
          this.users = value;
          break;
        case "group":
          this.groups = value;
          break;
        case "tokens":
          this.tokens = value;
          break;
        default:
          this.groups = value;
      }
    },
    handleRoleSelect(value) {
      this.roles = value;
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
      switch (this.modalType) {
        case "user":
          props = ["users", "path"];
          break;
        case "group":
          props = ["groups", "path"];
          break;
        case "tokens":
          props = ["tokens", "path"];
          break;
        default:
          props = ["path"];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
        path: this.path,
        roles: this.roles,
      };
      switch (this.modalType) {
        case "user":
          param["users"] = this.users;
          break;
        case "group":
          param["groups"] = this.groups;
          break;
        case "apiToken":
          param["tokens"] = this.tokens;
          break;
      }
      if (this.propagate) param["propagate"] = 1;
      this.createAccess(param).then((res) => {
        this.close();
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
