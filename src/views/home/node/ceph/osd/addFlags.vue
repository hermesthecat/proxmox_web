<template>
  <m-dialog :visible="visible" title="Manage Global OSD Flags" @close="close" @cancel="close" @confirm="confirm">
    <template slot="content">
      <el-scrollbar style="height: 450px">
        <div class="m-form__content">
          <div class="m-form__section">
            <el-table :data="flagList" ref="dataTable" @selection-change="(rows) => (selectedList = rows)">
              <el-table-column label="Enable" type="selection" width="55px"></el-table-column>
              <el-table-column label="Name" prop="name"></el-table-column>
              <el-table-column label="Description" prop="description"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </m-dialog>
</template>

<script>
import CephHttp from "@src/views/home/node/ceph/http";
export default {
  mixins: [CephHttp],
  name: "addFlags",
  props: {
    visible: Boolean,
  },
  data() {
    return {
      flagList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize request
    __init__() {
      let _this = this;
      _this.queryFlags({ _dc: new Date().getTime() }).then((res) => {
        _this.flagList = res;
        _this.$nextTick(() => {
          _this.flagList.forEach((item) => {
            if (item.value) {
              _this.$refs.dataTable.toggleRowSelection(item, true);
            }
          });
        });
      });
    },
    //Close dialog
    close() {
      this.$emit("close");
    },
    //Confirm add
    confirm() {
      let param = {};
      for (let i = 0; i < this.flagList.length; i++) {
        param[this.flagList[i].name] = this.selectedList.some(
          (item) => item.name === this.flagList[i].name
        )
          ? 1
          : 0;
      }
      this.addFlags(param).then((res) => {
        this.close();
      });
    },
  },
};
</script>
