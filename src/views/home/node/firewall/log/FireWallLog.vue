<template>
  <page-template>
    <div slot="toolbar-left"></div>
    <div slot="page-content">
      <ace-editor v-model="logContent" :read-only="true" ref="ace-editor"></ace-editor>
    </div>
  </page-template>
</template>
<script>
import AceEditor from "@src/components/ace/AceEditor";
import NodeFireWallLogHttp from "@view/home/node/firewall/log/http";
import PageTemplate from "@src/components/page/PageTemplate";
export default {
  name: "NodeFireWallLog",
  mixins: [NodeFireWallLogHttp],
  data() {
    return {
      logContent: "",
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
      _this.queryNodeFireWallLogList().then((res) => {
        _this.logContent = _this.db.nodeFireWallLogList
          .map((item) => {
            return item.t;
          })
          .join("\n");
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
