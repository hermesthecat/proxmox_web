<template>
  <div class="m-form__content">
    <div class="m-form__section">
      <dl>
        <dt>Basic Information</dt>
        <dd>
          <m-input type="text" prop="storage" label="ID" labelWidth="100px" validateEvent @validate="validate"
            :show-error="rules.storage.error" :error-msg="rules.storage.message" v-model="storage" required
            :disabled="!isCreate" placeholder="Please enter ID" />
          <m-checkbox label="Enable" v-model="disable" labelWidth="100px"></m-checkbox>

          <m-select labelWidth="100px" @on-change="handleZfsPoolSelect" prop="pool" label="ZFS Pool" validateEvent
            :disabled="!isCreate" @validate="validate" required :show-error="rules.pool.error"
            :error-msg="rules.pool.message" v-model="pool" placeholder="Please enter iSCSI provider">
            <m-option v-for="item in db.zfsList" :key="item.pool" :label="item.pool" :value="item.pool"></m-option>
          </m-select>
          <m-checkbox label="Thin Provisioning" v-model="sparse" labelWidth="100px"></m-checkbox>
          <m-input type="text" prop="blocksize" label="Block Size" labelWidth="100px" validateEvent @validate="validate"
            required :show-error="rules.blocksize.error" :error-msg="rules.blocksize.message" v-model="blocksize"
            placeholder="8k" />
          <m-select type="multiple" labelWidth="100px" @on-change="handleContentSelect" validateEvent
            @validate="validate" prop="content" v-model="content" required :show-error="rules.content.error"
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
  name: "CreateZfsStorage",
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
      username: "",
      blocksize: "",
      pool: "",
      target: "",
      comstar_tg: "",
      iscsiprovider: "comstar",
      comstar_hg: "",
      lio_tpg: "",
      shared: true,
      type: "dir",
      disable: false,
      maxfiles: 1,
      pveceph: false,
      krbd: false,
      sparse: false,
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
        storage: {
          error: false,
          message: "",
        },
        pool: {
          error: false,
          message: "",
        },
        content: {
          error: false,
          message: "",
        },
        blocksize: {
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
      let _this = this;
      _this.queryNode().then(() => {
        _this.$nextTick(() => {
          _this.db.nodeList.forEach((item) => {
            _this.nodes.forEach((node) => {
              if (item.node === node) {
                _this.$refs.dataTable.toggleRowSelection(item, true);
              }
            });
          });
        });
      });
      if (!_this.isCreate) {
        Object.keys(_this.param).forEach((key) => {
          if (
            ["disable", "shared", "sparse", "krbd", "pveceph"].includes(key)
          ) {
            _this[key] = _this.param[key] === 1 ? true : false;
          } else if (key === "nodes" || key === "content") {
            _this[key] = _this.param[key].split(",");
          } else {
            _this[key] = _this.param[key];
          }
        });
        this.disable = this.param.disable ? false : true;
      }
      _this.queryZfs();
    },
    // Single validation
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      // Validate if empty
      if (/^\s*$/.test(value) && prop !== "blocksize") {
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
      if (prop === "blocksize" && !/^[\d][k|m|t|p|g]$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Invalid block size format";
        return;
      }
    },
    // Select content
    handleContentSelect(value) {
      this.content = value;
    },
    handleSelectionChange(row) {
      this.nodes = row.map((item) => item.node);
    },
    // Validate all
    validateAll() {
      let props = ["storage", "blocksize", "content", "pool"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleZfsPoolSelect(value) {
      this.pool = value;
    },
  },
};
</script>
