<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showModal('create')"
        icon="el-icon-plus"
        >Create</m-button
      >
      <m-button
        type="danger"
        v-confirm="{
          msg: 'Are you sure you want to delete the selected items?',
          ok: () => handleDelete(),
          icon: 'icon-question',
        }"
        icon="el-icon-delete"
        :disabled="selectedList.length <= 0"
        >Delete</m-button
      >
      <m-button
        type="info"
        icon="el-icon-edit"
        :disabled="selectedList.length !== 1"
        @on-click="showModal('edit')"
        >Edit</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.fireWallGroupList"
        ref="dataTable"
        :row-key="setRowKeys"
        :expand-row-keys="expands"
        @selection-change="handleSelect"
        @expand-change="expandChange"
      >
        <el-table-column type="expand">
          <template slot-scope="parentSlot">
            <page-template>
              <div slot="toolbar-left">
                <m-button
                  type="primary"
                  @on-click="showRuleModal('create')"
                  icon="el-icon-plus"
                  >Add</m-button
                >
                <m-button
                  type="warning"
                  @on-click="showRuleModal('copy')"
                  icon="el-icon-copy-document"
                  :disabled="selectedRuleList && selectedRuleList.length !== 1"
                  >Copy</m-button
                >
                <m-button
                  type="danger"
                  v-confirm="{
                    msg: 'Are you sure you want to delete the selected items?',
                    ok: () => handleGroupRuleDelete(),
                    icon: 'icon-question',
                  }"
                  icon="el-icon-delete"
                  :disabled="selectedRuleList.length <= 0"
                  >Delete</m-button
                >
                <m-button
                  type="info"
                  icon="el-icon-edit"
                  :disabled="selectedRuleList.length !== 1"
                  @on-click="showRuleModal('edit')"
                  >Edit</m-button
                >
              </div>
              <div slot="page-content">
                <el-table
                  :data="db.fireWallRuleList"
                  @selection-change="handleRuleSelect"
                >
                  <el-table-column
                    type="selection"
                    width="55"
                    prop="pos"
                  ></el-table-column>
                  <el-table-column width="55" prop="pos"></el-table-column>
                  <el-table-column label="Enable" prop="enable">
                    <template slot-scope="scope">
                      <table-info-state
                        :content="
                          scope.row.enable && scope.row.enable === 1
                            ? 'Yes'
                            : 'No'
                        "
                        :state="
                          scope.row.enable && scope.row.enable === 1
                            ? 'actived'
                            : 'unActived'
                        "
                      ></table-info-state>
                    </template>
                  </el-table-column>
                  <el-table-column label="Type" prop="type"></el-table-column>
                  <el-table-column label="Action" prop="action"></el-table-column>
                  <el-table-column label="Macro" prop="macro"> </el-table-column>
                  <el-table-column label="Interface" prop="iface"></el-table-column>
                  <el-table-column label="Source" prop="source"></el-table-column>
                  <el-table-column label="Destination" prop="dest"></el-table-column>
                  <el-table-column label="Protocol" prop="proto"></el-table-column>
                  <el-table-column
                    label="Destination Port"
                    prop="dport"
                  ></el-table-column>
                  <el-table-column
                    label="Source Port"
                    prop="sport"
                  ></el-table-column>
                  <el-table-column label="Log Level" prop="log"></el-table-column>
                  <el-table-column
                    label="Comment"
                    prop="comment"
                  ></el-table-column>
                  <el-table-column width="100">
                    <template slot-scope="scope">
                      <m-button
                        type="info"
                        :icon="
                          scope.row.enable === 0
                            ? 'el-icon-video-play'
                            : 'el-icon-video-pause'
                        "
                        @on-click="
                          handleGroupEnable(parentSlot.row.group, scope.row)
                        "
                        >{{
                          scope.row.enable === 0 ? "Enable" : "Disable"
                        }}</m-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </page-template>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Group" prop="group"></el-table-column>
        <el-table-column label="Comment" prop="comment"></el-table-column>
      </el-table>
      <create-fire-wall-group-rule-modal
        :title="ruleTitle"
        :isCreate="isRuleCreate"
        :param="ruleParam"
        :visible="ruleVisible"
        v-if="ruleVisible"
        :modal-type="ruleType"
        :group="group"
        @close="
          ruleVisible = false;
          queryFireRuleList(group);
        "
      ></create-fire-wall-group-rule-modal>
      <create-fire-wall-group-modal
        :title="title"
        :isCreate="isCreate"
        :param="param"
        :visible="visible"
        v-if="visible"
        :modal-type="type"
        @close="
          visible = false;
          __init__();
        "
      ></create-fire-wall-group-modal>
    </div>
  </page-template>
</template>
<script>
import FireWallHttp from "@src/views/home/dataCenter/firewall/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateFireWallGroupRuleModal from "./CreateFireWallGroupRuleModal";
import CreateFireWallGroupModal from "./CreateFireWallGroupModal";
export default {
  name: "Access",
  mixins: [FireWallHttp],
  components: {
    PageTemplate,
    MButton,
    CreateFireWallGroupRuleModal,
    CreateFireWallGroupModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Security Group",
      selectedList: [],
      selectedRuleList: [],
      ruleParam: {},
      isRuleCreate: true,
      ruleTitle: "Add: Rule",
      ruleType: "create",
      ruleVisible: false,
      isCreate: true,
      param: {},
      isGroup: false,
      group: "",
      expands: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryFireWallGroupList();
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: Security Group" : "Edit: Security Group";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
      this.isGroup =
        this.selectedList[0] && this.selectedList[0].type === "group";
    },
    // Check if button is clickable
    inStatus() {
      return this.selectedList.length !== 1;
    },
    // Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.deleteFireWallGroup().catch((res) => {
        this.$confirm.error({
          msg: res,
        });
      });
    },
    handleGroupRuleDelete() {
      this.deleteFireWallGroupRule(this.group);
    },
    expandChange(row, expandedRows) {
      var that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.group);
          this.group = row.group;
          this.queryFireRuleList(this.group);
        }
      } else {
        that.expands = [];
      }
    },
    setRowKeys(row) {
      return row.group;
    },
    handleRuleSelect(rows) {
      this.selectedRuleList = rows;
    },
    showRuleModal(type) {
      this.ruleType = type;
      this.isRuleCreate = type === "create";
      this.ruleTitle = type === "create" ? "Create: Copy Job" : "Edit: Copy Job";
      this.ruleParam = type === "create" ? {} : this.selectedRuleList[0];
      this.ruleVisible = true;
      this.isGroup =
        this.selectedRuleList[0] && this.selectedRuleList[0].type === "group";
    },
  },
};
</script>

<style lang="less" scoped>
.cluster-desc {
  display: flex;
  margin: 10px 0px;
  padding: 10px 0px;
  border-top: 1px solid #c4d6ec;
  border-bottom: 1px solid #c4d6ec;
  &__item {
    flex: 1 1 auto;
    display: flex;
  }
  &__title {
    flex: 1 1 auto;
    display: inline-flex;
  }
  &__desc {
    flex: 1 1 auto;
    display: inline-flex;
  }
}
/deep/.page-template__content {
  height: auto !important;
}
</style>
