<template>
  <m-dialog :visible="visible" @cancel="close" @confirm="confirm" :title="title" :_style="{ width: '956px' }"
    @close="$emit('close')">
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content" v-if="modalType === 'create'">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-input type="text" prop="name" label="Name" labelWidth="100px" v-model="name" validateEvent
                @validate="validate" required :error-msg="rules['name'].message" :show-error="rules['name'].error"
                :placeholder="'Please enter name'" />
              <m-select prop="raidlevel" label="RAID Level" labelWidth="100px" @on-change="handleDestSelect"
                v-model="raidlevel" validateEvent @validate="validate" required :error-msg="rules['raidlevel'].message"
                :show-error="rules['raidlevel'].error" :readonly="true" placeholder="Please select disk">
                <m-option v-for="item in comboItems" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-select prop="compression" label="Compression" labelWidth="100px" @on-change="handleCompressSelect"
                v-model="compression" validateEvent @validate="validate" required
                :error-msg="rules['compression'].message" :show-error="rules['compression'].error"
                placeholder="Please select disk">
                <m-option v-for="item in compressionItems" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
              <m-checkbox label="Add Storage" v-model="add_storage" labelWidth="100px"></m-checkbox>
              <m-input type="number" prop="ashift" label="ashift" labelWidth="100px" v-model="ashift" :min="12"
                :placeholder="'Please enter ashift'" />
            </dd>
          </dl>
          <dl>
            <dt>Devices</dt>
            <dd>
              <el-table :data="db.nodeDiskList" ref="dataTable" @selection-change="handleSelect">
                <el-table-column type="selection" width="55" prop="pos"></el-table-column>
                <el-table-column width="55" prop="pos"></el-table-column>
                <el-table-column label="Device" prop="devpath"></el-table-column>
                <el-table-column label="Size" prop="size">
                  <template slot-scope="scope">
                    {{
                      scope.row && scope.row.size && byteToSize(scope.row.size)
                    }}
                  </template>
                </el-table-column>
                <el-table-column label="Serial" prop="serial"></el-table-column>
                <el-table-column label="Order" prop="order"></el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
      </div>
      <div v-if="modalType === 'detail'">
        <div slot="toolbar-left">
          <m-button type="primary" @on-click="__init__()" icon="el-icon-refresh">Reload</m-button>
        </div>
        <div slot="page-content">
          <single-line title="Scan" :desc="`${(db.nodeDiskSdaObj &&
              db.nodeDiskSdaObj.scan &&
              db.nodeDiskSdaObj.scan) ||
            ''
            }`" />
          <single-line title="Errors" :desc="`${(db.nodeDiskSdaObj &&
              db.nodeDiskSdaObj.errors &&
              db.nodeDiskSdaObj.errors) ||
            ''
            }`" />
          <overview-card style="width: 100%">
            <div slot="title">Devices</div>
            <template slot="content">
              <el-table :data="[db.nodeDiskSdaObj]" :row-key="setRowKeys" :expand-row-keys="expands"
                :tree-props="{ children: 'children' }">>
                <el-table-column label="Name" prop="name"></el-table-column>
                <el-table-column label="Health" prop="state">
                  <template slot-scope="scope">
                    <table-info-state :content="scope.row.state"
                      :state="scope.row.state && scope.row.state.toLowerCase()"></table-info-state>
                  </template>
                </el-table-column>
                <el-table-column label="READ" prop="read"></el-table-column>
                <el-table-column label="WRITE" prop="write"></el-table-column>
                <el-table-column label="CKSUM" prop="cksum"></el-table-column>
                <el-table-column label="Message" prop="msg"></el-table-column>
              </el-table>
            </template>
          </overview-card>
        </div>
      </div>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="confirm" v-if="modalType === 'create'">Create</m-button>
      <div v-else></div>
    </template>
  </m-dialog>
</template>

<script>
import PageTemplate from "@src/components/page/PageTemplate";
import SingleLine from "@src/components/chart/line/SingleLine";
import OverviewCard from "@src/components/card/OverviewCard";
import Dialog from "@src/components/dialog/Dialog";
import NodeDiskZfsHttp from "@src/views/home/node/disk/zfs/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateZfsModal",
  mixins: [NodeDiskZfsHttp],
  components: {
    Dialog,
    PageTemplate,
    SingleLine,
    OverviewCard,
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
    modalType: {
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
      device: "",
      name: "",
      add_storage: true,
      ashift: 12,
      raidlevel: "single",
      compression: "on",
      selectedList: [],
      expands: [],
      comboItems: [
        { value: "single", label: "Single Disk" },
        { value: "mirror", label: "Mirror" },
        { value: "raid10", label: "RAID10" },
        { value: "raidz", label: "RAIDZ" },
        { value: "raidz2", label: "RAIDZ2" },
        { value: "raidz3", label: "RAIDZ3" },
      ],
      compressionItems: [
        { label: "on", value: "on" },
        { label: "off", value: "off" },
        { label: "gzip", value: "gzip" },
        { label: "lz4", value: "lz4" },
        { label: "lzjb", value: "lzjb" },
        { label: "zle", value: "zle" },
      ],
      rules: {
        name: {
          error: false,
          message: "",
        },
        device: {
          error: false,
          message: "",
        },
        compression: {
          error: false,
          message: "",
        },
        raidlevel: {
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
    byteToSize,
    //Request disk
    async __init__() {
      let _this = this;
      if (_this.modalType === "create")
        this.queryListNodeDiskList({ type: "unused" });
      else if (_this.modalType === "detail")
        _this
          .querySda({ _dc: new Date().getTime(), name: this.param.name })
          .then(() => {
            _this.expands = _this.db.nodeDiskSdaObj &&
              _this.db.nodeDiskSdaObj.name && [_this.db.nodeDiskSdaObj.name];
          });
    },
    //Select disk
    handleDestSelect(value) {
      this.device = value;
    },
    //Select compression
    handleCompressSelect(value) {
      this.compression = value;
    },
    //Select device
    handleSelect(row) {
      this.selectedList = row.map((item) => item.devpath);
    },
    //Close dialog
    close() {
      this.$emit("close");
    },
    //Validate form
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
    //Validate all form fields
    validateAll() {
      let props = ["name"];
      props.forEach((prop) => this.validate(prop));
      return props.some(
        (prop) =>
          this.rules[prop].error === true || this.selectedList.length <= 0
      );
    },
    //Select file system
    handleFsSelect(value) {
      this.filesystem = value;
    },
    //Confirm add
    confirm() {
      if (this.validateAll()) return;
      let param = {
        name: this.name,
        add_storage: this.add_storage ? 1 : 0,
        devices: this.selectedList.join(","),
        compression: this.compression,
        ashift: this.ashift,
        raidlevel: this.raidlevel,
      };

      this.createZfs(param)
        .then((res) => {
          this.close();
        })
        .catch((res) => {
          this.$confirm
            .error({
              msg: res,
              icon: "icon-error",
            })
            .then(() => this.close());
        });
    },
    //Expand table
    expandChange(row, expandedRows) {
      var that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.name);
        }
      } else {
        that.expands = [];
      }
    },
    //Set row keys
    setRowKeys(row) {
      return row.name;
    },
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
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
