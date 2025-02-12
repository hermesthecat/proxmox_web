<template>
  <m-dialog
    :title="title"
    :visible="visible"
    :_style="{
      maxHeight: '450px',
    }"
    @confirm="confirm"
    @cancel="close"
    @close="close"
  >
    <div slot="content">
      <el-table
        :data="qemuList"
        height="300"
        @selection-change="handleSelect"
        v-if="modalType === 'qemu'"
      >
        <el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="ID" prop="vmid"></el-table-column>
        <el-table-column label="Node" prop="node"></el-table-column>
        <el-table-column label="Status" prop="status"></el-table-column>
        <el-table-column label="Name" prop="name"></el-table-column>
        <el-table-column label="Category" prop="type"></el-table-column>
      </el-table>
      <m-select
        prop="storage"
        v-model="storage"
        @on-change="(value) => (storage = value)"
        vidateEvent
        @validate="validate"
        :show-error="rules['storage'].error"
        :error-msg="rules['storage'].message"
        label="Storage"
        v-else
        labelWidth="100px"
      >
        <template v-for="(item, index) in storageList" :key="item.storage">
          <m-option
            :label="item.storage"
            :value="item.storage"
          >
            <div class="table-tr" v-show="index === 0">
              <div class="table-td">Name</div>
              <div class="table-td">Category</div>
              <div class="table-td">Available</div>
              <div class="table-td">Capacity</div>
            </div>
            <div class="table-tr">
              <div class="table-td">{{ item.storage }}</div>
              <div class="table-td">{{ item.type }}</div>
              <div class="table-td">{{ byteToSize(item.avail) }}</div>
              <div class="table-td">{{ byteToSize(item.total) }}</div>
            </div>
          </m-option>
        </template>
      </m-select>
    </div>
  </m-dialog>
</template>

<script>
import PoolsHttp from "@src/views/home/pool/http";
import { byteToSize, quickSort } from "@libs/utils/index";
export default {
  name: "AddPoolModal",
  mixins: [PoolsHttp],
  props: {
    modalType: String,
    title: String,
    visible: Boolean,
  },
  data() {
    return {
      qemuList: [],
      storageList: [],
      selectedList: [],
      storage: "",
      rules: {
        storage: {
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
    __init__() {
      let _this = this;
      //Filter unassigned VMs when type is qemu
      if (_this.modalType === "qemu") {
        let list = _this.db.poolsObj.members.map((it) => {
          return it.name;
        });
        _this.queryResource().then((res) => {
          _this.qemuList = _this.db.resources.filter((item) => {
            if (
              (item.type === "qemu" || item.type === "lxc") &&
              !list.includes(item.name)
            ) {
              return item;
            }
          });
        });
      } else {
        //Query storage
        _this.queryStorage({ format: 1 }).then((res) => {
          _this.storageList = quickSort(this.db.storageList, "storage", "+");
        });
      }
    },
    //Close dialog
    close() {
      this.$emit("close");
    },
    //Confirm add
    confirm() {
      if (this.modalType === "qemu") {
        if (this.selectedList.length <= 0) return;
        let param = {
          vms: this.selectedList.map((item) => item.vmid).join(","),
        };
        //Update pool
        this.updatePool(param).then((res) => {
          this.close();
        });
      } else {
        this.validate("storage");
        let param = {
          storage: this.storage,
        };
        if (this.rules.storage.error) return;
        //Update pool
        this.updatePool(param).then((res) => {
          this.close();
        });
      }
    },
    //Multiple selection
    handleSelect(row) {
      this.selectedList = row;
    },
    //Validate
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty!";
        return;
      }
    },
  },
};
</script>

<style scoped></style>
