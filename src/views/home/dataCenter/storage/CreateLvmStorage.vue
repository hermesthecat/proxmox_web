<template>
  <div class="m-form__content">
    <div class="m-form__section">
      <dl>
        <dt>Basic Information</dt>
        <dd>
          <m-input type="text" prop="storage" label="ID" labelWidth="100px" validateEvent @validate="validate" required
            :show-error="rules.storage.error" :error-msg="rules.storage.message" v-model="storage" :disabled="!isCreate"
            placeholder="Please enter ID" />
          <m-checkbox label="Shared" v-model="shared" labelWidth="100px"></m-checkbox>
          <m-select labelWidth="100px" @on-change="handleBaseselSelect" validateEvent @validate="validate"
            prop="basesel" v-model="basesel" required :show-error="rules.basesel.error"
            :error-msg="rules.basesel.message" v-show="isCreate" label="Base Storage">
            <template v-if="db.iscsiList && db.iscsiList.length > 0">
              <m-option v-for="item in db.iscsiList" :key="item.storage" :label="item.storage + ' (iSCSI)'"
                :value="item.storage"></m-option>
            </template>
            <template v-else>
              <m-option key="local" label="Existing Volume Group" value="local"></m-option>
            </template>
          </m-select>
          <m-select labelWidth="100px" @on-change="handleVgNameSelect" validateEvent @validate="validate" prop="vgname"
            v-model="vgname" :disabled="!isCreate" required :show-error="rules.vgname.error"
            :error-msg="rules.vgname.message" label="Volume Group">
            <m-option v-for="item in db.vgList" :key="item.vg" :label="item.vg" :value="item.vg">{{ item.vg
              }}</m-option>
          </m-select>
          <m-select type="multiple" labelWidth="100px" @on-change="handleSelect" validateEvent @validate="validate"
            prop="content" v-model="content" required :show-error="rules.content.error"
            :error-msg="rules.content.message" label="Content">
            <m-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></m-option>
          </m-select>
          <m-checkbox label="Enable" v-model="disable" labelWidth="100px"></m-checkbox>
        </dd>
      </dl>
      <dl>
        <dt>Nodes</dt>
        <dd>
          <el-table :data="db.nodeList" ref="dataTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="Node" prop="node" sortable></el-table-column>
            <el-table-column label="Memory Usage">
              <template slot-scope="scope">
                {{
                  scope.row.mem &&
                  scope.row.maxmem &&
                  percentToFixed(scope.row.mem / scope.row.maxmem, 3)
                }}
              </template>
            </el-table-column>
            <el-table-column label="CPU Usage">
              <template slot-scope="scope">
                {{
                  scope.row.cpu &&
                  scope.row.cpu &&
                  scope.row.maxcpu &&
                  percentToFixed(scope.row.cpu, 3) + ` of ${scope.row.maxcpu}`
                }}
              </template>
            </el-table-column>
          </el-table>
        </dd>
      </dl>
    </div>
  </div>
</template>
<script>
import DataCenterStorageHttp from "@src/views/home/dataCenter/storage/http";
import { flotToFixed, percentToFixed } from "@libs/utils/index";
export default {
  name: "CreateDirStorage",
  mixins: [DataCenterStorageHttp],
  props: {
    isCreate: {
      type: Boolean,
      default: true,
    },
    param: {
      type: Object,
    },
  },
  data() {
    return {
      storage: "",
      vgname: "",
      basesel: "",
      content: ["images"],
      nodes: [],
      shared: true,
      type: "lvm",
      disable: false,
      maxfiles: 1,
      options: [
        {
          label: "Disk Images",
          value: "images",
        },
        {
          label: "Containers",
          value: "rootdir",
        },
      ],
      rules: {
        vgname: {
          error: false,
          message: "",
        },
        storage: {
          error: false,
          message: "",
        },
        basesel: {
          error: false,
          message: "",
        },
        content: {
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
    flotToFixed,
    percentToFixed,
    __init__() {
      this.queryNode().then(() => {
        this.$nextTick(() => {
          _this.db.nodeList.forEach((item) => {
            _this.nodes.forEach((node) => {
              if (item.node === node) {
                _this.$refs.dataTable.toggleRowSelection(item, true);
              }
            });
          });
        });
      });
      this.queryVg();
      this.queryIs();
      let _this = this;
      if (this.isCreate) {
        this.storage = "";
        this.vgname = "";
        this.basesel = "";
        this.content = ["images"];
        this.nodes = [];
        this.shared = true;
        this.type = "dir";
        this.disable = false;
        this.maxfiles = 1;
      } else {
        Object.keys(this.param).forEach((key) => {
          if (["disable", "shared"].includes(key)) {
            _this[key] = _this.param[key] === 1 ? true : false;
          } else if (key === "nodes" || key === "content") {
            debugger;
            _this[key] = _this.param[key].split(",");
          } else {
            this[key] = this.param[key];
          }
        });
        this.disable = this.param.disable ? false : true;
      }
    },
    // Single validation
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      // Validate if empty
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty";
        return;
      }
      // Validate name
      if (
        prop === "storage" &&
        !/^[A-Z|a-z][\w\-\_\.]{0,}[A-Z|a-z|0-9]$/.test(value)
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message =
          "ID must start with A-Z|a-z, end with A-Z|a-z|0-9, minimum 2 characters, allowing 'A-Z','a-z','0-9','-',_,'.'";
        return;
      }
      if (prop === "path" && !/^[\/][A-Za-z\\\-\_0-9]{1,}/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Path must be absolute starting with /";
        return;
      }
    },
    // Select content
    handleSelect(value) {
      this.content = value;
    },
    handleSelectionChange(row) {
      this.nodes = row.map((item) => item.node);
    },
    // Validate all
    validateAll() {
      let props = ["storage", "vgname", "basesel", "content"];
      if (!this.isCreate) props = ["storage", "vgname", "content"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    // Select existing volume group
    handleBaseselSelect(value) {
      this.basesel = value;
    },
    // Select vgName
    handleVgNameSelect(value) {
      this.vgname = value;
    },
  },
};
</script>
