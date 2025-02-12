<template>
  <div class="m-form__content">
    <div class="m-form__section">
      <dl>
        <dt>Basic Information</dt>
        <dd>
          <m-input
            type="text"
            prop="storage"
            label="ID"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.storage.error"
            :error-msg="rules.storage.message"
            v-model="storage"
            required
            :disabled="!isCreate"
            placeholder="Please enter ID"
          />
          <m-input
            type="text"
            prop="monhost"
            label="Monitor(s)"
            labelWidth="100px"
            :disabled="pveceph"
            validateEvent
            @validate="validate"
            required
            :show-error="rules.monhost.error"
            :error-msg="rules.monhost.message"
            v-model="monhost"
            placeholder="Please enter monitor"
          />
          <m-input
            type="text"
            prop="username"
            label="Username"
            labelWidth="100px"
            :disabled="!isCreate || pveceph"
            v-model="username"
            placeholder="Please enter username"
          />
          <m-checkbox
            label="Enable"
            v-model="disable"
            labelWidth="100px"
          ></m-checkbox>
          <m-select
            type="multiple"
            labelWidth="100px"
            @on-change="handleSelect"
            validateEvent
            @validate="validate"
            prop="content"
            v-model="content"
            required
            :show-error="rules.content.error"
            :error-msg="rules.content.message"
            label="Content"
          >
            <m-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></m-option>
          </m-select>
          <m-input
            type="number"
            prop="maxfiles"
            label="Max Backups"
            labelWidth="100px"
            validateEvent
            @validate="validate"
            :show-error="rules.maxfiles.error"
            :error-msg="rules.maxfiles.message"
            min="0"
            :disabled="content.indexOf('backup') === -1"
            v-model="maxfiles"
            placeholder="Please enter max backups"
          />
          <m-checkbox
            label=""
            v-model="pveceph"
            :disabled="!pvecephPossible"
            @change="
              (value) => {
                if (value) {
                  monhost = quickSort(
                    this.db.cephMonList.map((item) => item.name),
                    'name'
                  ).join(',');
                  username = 'admin';
                } else {
                  monhost = '';
                  username = '';
                }
              }
            "
            labelWidth="100px"
            >Use Proxmox VE managed hyper-converged cephFS</m-checkbox
          >
        </dd>
      </dl>
      <dl>
        <dt>Nodes</dt>
        <dd>
          <el-table
            :data="db.nodeList"
            ref="dataTable"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column
              label="Node"
              prop="node"
              sortable
            ></el-table-column>
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
import { flotToFixed, percentToFixed, quickSort } from "@libs/utils/index";
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
      monhost: "",
      content: ["images"],
      nodes: [],
      username: "admin",
      shared: true,
      type: "dir",
      disable: false,
      maxfiles: 1,
      pveceph: true,
      pvecephPossible: true,
      options: [
        {
          label: "ISO Images",
          value: "iso",
        },
        {
          label: "VZDump Backup Files",
          value: "backup",
        },
        {
          label: "Containers",
          value: "rootdir",
        },
        {
          label: "Snippets",
          value: "snippets",
        },
      ],
      rules: {
        storage: {
          error: false,
          message: "",
        },
        monhost: {
          error: false,
          message: "",
        },
        maxfiles: {
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
    quickSort,
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
      if (this.isCreate) {
      } else {
        Object.keys(this.param).forEach((key) => {
          if (["disable", "shared", "pveceph"].includes(key)) {
            this[key] = this.param[key] === 0 ? true : false;
          } else if (key === "nodes" || key === "content") {
            this[key] = this.param[key].split(",");
          } else {
            this[key] = this.param[key];
            this.disable = true;
          }
        });
        this.disable = this.param.disable ? false : true;
      }
      if (this.isCreate)
        this.queryCephMon()
          .then((res) => {
            this.monhost = quickSort(
              this.db.cephMonList.map((item) => item.name),
              "name"
            ).join(",");
            if (this.isCreate) {
              this.pvecephPossible = true;
            } else {
              this.pveceph = false;
            }
          })
          .catch((res) => {
            this.pvecephPossible = false;
            this.pveceph = false;
          });
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
      let props = ["storage", "monhost", "content", "maxfiles"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
  },
};
</script>
