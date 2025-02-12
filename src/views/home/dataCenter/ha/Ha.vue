<template>
  <div style="padding: 20px">
    <overview-card>
      <div slot="title">Status</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showStatus }"
        class="m-tool-img"
        @click.stop="handleCollpise('status')"
      ></div>
      <div slot="content" class="card-content" v-if="showStatus">
        <div class="card-item">
          <page-template>
            <div slot="page-content">
              <el-table :data="db.haStatusList" ref="dataTable">
                <el-table-column label="Type" prop="type"></el-table-column>
                <el-table-column label="Status" prop="status"></el-table-column>
              </el-table>
            </div>
          </page-template>
        </div>
      </div>
    </overview-card>
    <overview-card>
      <div slot="title">Resources</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showResource }"
        class="m-tool-img"
        @click.stop="handleCollpise('resource')"
      ></div>
      <div slot="content" class="card-content" v-if="showResource">
        <div class="card-item">
          <page-template>
            <div slot="toolbar-left" style="padding-top: 10px">
              <m-button
                type="primary"
                @on-click="showModal('create')"
                icon="el-icon-plus"
                >Add</m-button
              >
              <m-button
                type="danger"
                @on-click="showModal('edit')"
                icon="el-icon-edit"
                :disabled="selectedList.length <= 0"
                >Edit</m-button
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
            </div>
            <div slot="page-content">
              <el-table
                :data="db.haResourceList"
                ref="dataTable"
                @selection-change="handleSelect"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="ID" prop="sid"></el-table-column>
                <el-table-column label="Status" prop="state"></el-table-column>
                <el-table-column label="Node" prop="node"></el-table-column>
                <el-table-column label="Name" prop="sid"></el-table-column>
                <el-table-column
                  label="Max Restart"
                  prop="max_restart"
                ></el-table-column>
                <el-table-column
                  label="Max Relocate"
                  prop="max_relocate"
                ></el-table-column>
                <el-table-column label="Group" prop="group"></el-table-column>
                <el-table-column label="Description" prop="comment"></el-table-column>
              </el-table>
            </div>
          </page-template>
          <create-ha-modal
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
          ></create-ha-modal>
        </div>
      </div>
    </overview-card>
  </div>
</template>
<script>
import OverviewCard from "@src/components/card/OverviewCard";
import HaHttp from "@src/views/home/dataCenter/ha/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import CreateHaModal from "./CreateHaModal";
export default {
  name: "Ha",
  mixins: [HaHttp],
  components: {
    PageTemplate,
    OverviewCard,
    MButton,
    CreateHaModal,
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      showStatus: true,
      showResource: true,
      resourceList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // Initialize search
    __init__() {
      this.queryHaStatus();
    },
    // Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title =
        type === "create" ? "Add: Resource: Container/VM" : "Edit: Copy Job";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    // Check if button is clickable
    inStatus() {
      return this.selectedList.length <= 0;
    },
    // Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    handleDelete(type) {
      this.deleteHa();
    },
    handleCollpise(type) {
      if (type === "status") {
        this.showStatus = !this.showStatus;
      } else {
        this.showResource = !this.showResource;
      }
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
.card {
  width: 100%;
}
.m-tool-img {
  background-image: url("~@images/tool-sprites.png");
  overflow: hidden;
  width: 16px;
  height: 16px;
  margin: 0;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
  opacity: 0.8;
  background-position-y: -224px;
  display: inline-block;
  transition: transform 0.5s linear;
}
.m-tool-collpise {
  transform: rotate(180deg);
  transition: transform 0.5s linear;
}
/deep/.card {
  min-height: auto !important;
}
/deep/.page-template__content {
  height: auto !important;
}
</style>
