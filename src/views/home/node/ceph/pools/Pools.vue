<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" icon="el-icon-plus" @on-click="visible = true"
        >Create</m-button
      >
      <m-button
        type="danger"
        icon="el-icon-delete"
        @on-click="showDelete = true"
        :disabled="selectedList.length <= 0"
        >Destroy</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="poolList"
        @selection-change="(row) => (selectedList = row)"
      >
        <el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="Name" prop="pool_name"></el-table-column>
        <el-table-column label="Size/Min" prop="pool_name">
          <template slot-scope="scope">
            {{ scope.row.min_size + "/" + scope.row.size }}
          </template>
        </el-table-column>
        <el-table-column
          label="Placement Groups"
          prop="pg_num"
        ></el-table-column>
        <el-table-column label="CRUSH Rule">
          <el-table-column label="ID" prop="crush_rule"></el-table-column>
          <el-table-column
            label="Name"
            prop="crush_rule_name"
          ></el-table-column>
        </el-table-column>
        <el-table-column label="Used">
          <el-table-column label="%" prop="percent_used">
            <template slot-scope="scope">
              {{
                flotToFixed(
                  (scope.row &&
                    scope.row.percent_used &&
                    scope.row.percent_used) ||
                    0,
                  2
                )
              }}
            </template>
          </el-table-column>
          <el-table-column label="Total" prop="bytes_used">
            <template slot-scope="scope">
              {{
                byteToSize(
                  (scope.row && scope.row.bytes_used && scope.row.bytes_used) ||
                    0
                )
              }}
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
      <create-pools
        v-if="visible"
        :visible="visible"
        @close="visible = false"
      ></create-pools>
      <m-dialog
        :visible="showDelete"
        v-if="showDelete"
        @confirm="confirm"
        @cancel="showDelete = false"
        @close="showDelete = false"
        title="Destroy: Ceph Pool"
      >
        <div slot="content">
          <div class="m-input__section">
            <base-icon name="icon-warning" />
            <div style="display: inline-flex">
              <ul>
                <li>Ceph Pool {{ selectedList[0].pool_name }} - Destroy</li>
                <li>Please enter ID to confirm ({{ selectedList[0].pool_name }})</li>
              </ul>
              <m-input
                v-model="pool_id"
                prop="pool_id"
                validateEvent
                @validate="validate"
                required
                :show-error="rules['pool_id'].error"
                :error-msg="rules['pool_id'].message"
              />
            </div>
          </div>
        </div>
      </m-dialog>
      <m-dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: Task Progress"
      >
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="Output" name="log"></m-tab-panel>
            <m-tab-panel label="Status" name="status"></m-tab-panel>
          </m-tab>
          <m-button
            class="create-btn m-margin-top-10"
            type="primary"
            @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >Stop</m-button
          >
          <el-scrollbar style="height: 100%">
            <div class="taskmodal-content">
              <div class="table" v-if="tab === 'log'">
                <div
                  class="table-tr"
                  v-for="item in db.addClusterLogList"
                  :key="item.n"
                >
                  {{ item.t }}
                </div>
              </div>
              <div class="table" v-if="tab === 'status'">
                <template v-for="(item, key) in db.addClusterStatusObj">
                  <div
                    class="table-tr"
                    v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                    :key="key"
                  >
                    <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                    <div class="table-td" v-if="key === 'starttime'">
                      {{
                        dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm")
                      }}
                    </div>
                    <div class="table-td" v-else>{{ item }}</div>
                  </div>
                </template>
              </div>
            </div>
          </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
    </div>
  </page-template>
</template>

<script>
import PageTemplate from "@src/components/page/PageTemplate";
import CephHttp from "@src/views/home/node/ceph/http";
import {
  byteToSize,
  flotToFixed,
  quickSort,
  dateFormat,
} from "@libs/utils/index";
import CreatePools from "./CreatePools";
import BaseIcon from "@src/components/icon/BaseIcon.vue";
export default {
  name: "Pools",
  mixins: [CephHttp],
  components: {
    PageTemplate,
    CreatePools,
    BaseIcon,
  },
  mounted() {
    this.__init__();
  },
  data() {
    return {
      pool_id: "",
      poolList: [],
      visible: false,
      showLog: false,
      showDelete: false,
      tab: "log",
      interVal: null,
      selectedList: [],
      rules: {
        pool_id: {
          message: "",
          error: false,
        },
      },
    };
  },
  methods: {
    byteToSize,
    flotToFixed,
    dateFormat,
    closeLog() {
      this.showLog = false;
      this.showDelete = false;
    },
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    handleTabChange(value) {
      this.tab = value;
    },
    __init__() {
      this.queryCephPools().then((res) => {
        this.poolList = quickSort(res, "pool_name", "+");
      });
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "ID cannot be empty!";
        return;
      }
      if (value && value !== this.selectedList[0].pool_name) {
        this.rules[prop].error = true;
        this.rules[prop].message = "ID is incorrect!";
        return;
      }
    },
    confirm() {
      //Validate pool ID
      this.validate("pool_id");
      if (this.rules["pool_id"].error) return;
      //Delete pool
      this.deleteCephPool(this.selectedList[0].pool_name).then((res) => {
        this.showLog = true; //Show log dialog
        this.interVal = setInterval(() => {
          //Query status
          this.queryStatus(
            this.db.addClusterStatusObj.node,
            this.db.addClusterStatusObj.upid
          );
          //Query log
          this.queryLog(
            this.db.addClusterStatusObj.node,
            this.db.addClusterStatusObj.upid
          );
        }, 3000);
      });
    },
  },
};
</script>
