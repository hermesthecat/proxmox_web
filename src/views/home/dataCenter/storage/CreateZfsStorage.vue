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
          <m-input type="text" prop="portal" label="Portal" labelWidth="100px" validateEvent :disabled="!isCreate"
            @validate="validate" :show-error="rules.portal.error" :error-msg="rules.portal.message" v-model="portal"
            required placeholder="Please enter portal" />
          <m-select labelWidth="100px" @on-change="handleSelect" prop="iscsiprovider" label="iSCSI Provider"
            :disabled="!isCreate" validateEvent @validate="validate" required :show-error="rules.iscsiprovider.error"
            :error-msg="rules.iscsiprovider.message" v-model="iscsiprovider" placeholder="Please enter iSCSI provider">
            <m-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></m-option>
          </m-select>
          <m-input type="text" prop="pool" label="Resource Pool" :disabled="!isCreate" labelWidth="100px" validateEvent
            @validate="validate" required :show-error="rules.pool.error" :error-msg="rules.pool.message" v-model="pool"
            placeholder="Please enter resource pool" />
          <m-input type="text" prop="blocksize" label="Block Size" labelWidth="100px" :disabled="!isCreate"
            validateEvent @validate="validate" required :show-error="rules.blocksize.error"
            :error-msg="rules.blocksize.message" v-model="blocksize" placeholder="Please enter block size" />
          <m-input type="text" prop="target" label="Target" labelWidth="100px" validateEvent :disabled="!isCreate"
            @validate="validate" required :show-error="rules.target.error" :error-msg="rules.target.message"
            v-model="target" placeholder="Please enter target" />
          <m-checkbox label="Thin Provisioning" v-model="sparse" :disabled="['LIO', 'IET'].includes(iscsiprovider)"
            labelWidth="100px"></m-checkbox>
          <m-input type="text" prop="comstar_tg" label="Target Group" labelWidth="100px"
            :disabled="iscsiprovider !== 'Comstar' || !isCreate" v-model="comstar_tg"
            placeholder="Please enter target group" />
          <m-checkbox label="Write Cache" v-model="writecache" labelWidth="100px"></m-checkbox>
          <m-input type="text" prop="comstar_hg" label="Host Group" labelWidth="100px" validateEvent
            :disabled="iscsiprovider !== 'Comstar' || !isCreate" v-model="comstar_hg"
            placeholder="Please enter host group" />

          <m-input type="number" prop="lio_tpg" label="Target Portal Group" labelWidth="100px" validateEvent
            @validate="validate" :show-error="rules.lio_tpg.error" :error-msg="rules.lio_tpg.message"
            :disabled="iscsiprovider !== 'LIO' || !isCreate" v-model="lio_tpg"
            placeholder="Please enter target portal group" />
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
      portal: "",
      username: "",
      blocksize: "4k",
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
      writecache: false,
      options: [
        {
          label: "comstar",
          value: "comstar",
        },
        {
          label: "istgt",
          value: "istgt",
        },
        {
          label: "IET",
          value: "IET",
        },
        {
          label: "LIO",
          value: "LIO",
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
        portal: {
          error: false,
          message: "",
        },
        blocksize: {
          error: false,
          message: "",
        },
        target: {
          error: false,
          message: "",
        },
        lio_tpg: {
          error: false,
          message: "",
        },
        iscsiprovider: {
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
      if (!this.isCreate) {
        debugger;
        Object.keys(this.param).forEach((key) => {
          if (
            ["disable", "shared", "sparse", "krbd", "pveceph"].includes(key)
          ) {
            this[key] = this.param[key] === 0 ? true : false;
          } else if (key === "nodes" || key === "content") {
            this[key] = this.param[key].split(",");
          } else if (key === "nowritecache") {
            this["writecache"] = this.param[key] === 0 ? true : false;
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
      this.iscsiprovider = value;
    },
    handleSelectionChange(row) {
      this.nodes = row.map((item) => item.node);
    },
    // Validate all
    validateAll() {
      let props = ["storage", "blocksize", "portal", "target", "pool"];
      if (this.iscsiprovider === "LIO") {
        props.push("lio_tpg");
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
  },
};
</script>
