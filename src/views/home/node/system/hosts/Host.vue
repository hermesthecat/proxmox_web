<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="updateHost" icon="el-icon-edit"
        :disabled="oldContent === hostContent">Save</m-button>
      <m-button type="primary" @on-click="hostContent = oldContent" icon="el-icon-edit"
        :disabled="oldContent === hostContent">Reset</m-button>
    </div>
    <div slot="page-content">
      <ace-editor v-model="hostContent" ref="ace-editor"></ace-editor>
    </div>
  </page-template>
</template>
<script>
import AceEditor from "@src/components/ace/AceEditor";
import NodeSystemHostsHttp from "@view/home/node/system/hosts/http";
import PageTemplate from "@src/components/page/PageTemplate";
export default {
  name: "NodeSystemHosts",
  mixins: [NodeSystemHostsHttp],
  data() {
    return {
      hostContent: "",
      oldContent: "",
    };
  },
  components: {
    AceEditor,
    PageTemplate,
  },
  mounted() {
    let _this = this;
    _this.__init__();
    _this.$refs[`ace-editor`].$el.style.height =
      _this.$el.parentElement.clientHeight - 100 + "px";
    window.addEventListener("resize", _this.updateAceEditorHeight, false);
  },
  methods: {
    __init__() {
      let _this = this;
      _this.queryHosts().then((res) => {
        _this.hostContent = _this.db.systemHostObj.data;
        _this.oldContent = _this.db.systemHostObj.data;
      });
    },
    updateAceEditorHeight() {
      let _this = this;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$el.parentElement.clientHeight - 100 + "px";
    },
    updateHost() {
      let _this = this;
      _this
        .updateHosts({
          data: _this.hostContent,
          digest: _this.db.systemHostObj.digest,
        })
        .then((res) => {
          _this.oldContent = _this.db.systemHostObj.data;
        })
        .catch((res) => {
          _this.$confirm.error({
            msg: res,
          });
        });
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateAceEditorHeight, false);
  },
};
</script>
