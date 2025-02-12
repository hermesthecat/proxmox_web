<template>
  <div class="m-form__content">
    <div class="m-form__section">
      <dl>
        <dt>Basic Information</dt>
        <dd>
          <m-input type="text" prop="storage" label="ID" labelWidth="100px" validateEvent @validate="validate" required
            :show-error="rules.storage.error" :error-msg="rules.storage.message" v-model="storage" :disabled="!isCreate"
            placeholder="Please enter ID" />

          <m-select labelWidth="100px" @on-change="handleVgNameSelect" validateEvent @validate="validate" prop="vgname"
            v-model="vgname" required :show-error="rules.vgname.error" :error-msg="rules.vgname.message"
            :disabled="!isCreate" label="Volume Group">
            <m-option v-for="item in db.vgList" :key="item.vg" :label="item.vg" :value="item.vg">{{ item.vg
              }}</m-option>
          </m-select>

          <m-select type="multiple" labelWidth="100px" @on-change="handleLvSelect" @visible-change="handlePoolReq"
            validateEvent @validate="validate" prop="thinpool" required v-model="thinpool" :disabled="!isCreate"
            :show-error="rules.thinpool.error" :error-msg="rules.thinpool.message" label="Thin Pool">
            <m-option v-for="item in db.poolThinList" :key="item.lv" :label="item.lv" :value="item.lv"></m-option>
          </m-select>

          <m-checkbox label="Enable" v-model="disable" labelWidth="100px"></m-checkbox>

          <m-select type="multiple" labelWidth="100px" @on-change="handleSelect" validateEvent @validate="validate"
            prop="content" v-model="content" required :show-error="rules.content.error"
            :error-msg="rules.content.message" label="Content">
            <m-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></m-option>
          </m-select>
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
  name: "CreateLvmThinStorage",
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
      content: ["images"],
      nodes: [],
      shared: true,
      type: "dir",
      disable: false,
      maxfiles: 1,
      thinpool: [],
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
        content: {
          error: false,
          message: "",
        },
        thinpool: {
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
          this.db.nodeList.forEach((item) => {
            this.nodes.forEach((node) => {
              if (item.node === node) {
                this.$refs.dataTable.toggleRowSelection(item, true);
              }
            });
          });
        });
      });
      this.queryVg();
      if (this.isCreate) {
        this.storage = "";
        this.vgname = "";
        this.content = ["images"];
        this.nodes = [];
        this.thinpool = [];
        this.shared = true;
        this.type = "lvmthin";
        this.disable = false;
        this.maxfiles = 1;
      } else {
        Object.keys(this.param).forEach((key) => {
          if (["disable", "shared"].includes(key)) {
            this[key] = this.param[key] === 1 ? true : false;
          } else if (
            key === "nodes" ||
            key === "content" ||
            key === "thinpool"
          ) {
            this[key] = this.param[key].split(",");
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
      let props = ["storage", "vgname", "content", "thinpool"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    // Select vgName
    handleVgNameSelect(value) {
      this.vgname = value;
    },
    // Request thin pool
    handlePoolReq() {
      this.validate("vgname");
      if (this.rules["vgname"].error) return;
      this.queryPoolThin(this.vgname);
    },
    // Select thin pool
    handleLvSelect(value) {
      this.thinpool = value;
    },
  },
};
</script>
