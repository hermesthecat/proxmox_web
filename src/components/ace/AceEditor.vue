<template>
  <!-- Do not use id as mentioned in official docs, it can cause issues during production build. Use ref or DOM instead -->
  <div class="ace-editor" ref="ace" style="height: 500px"></div>
</template>
<script>
import ace from "ace-builds";
//import 'ace-builds/webpack-resolver';
import "ace-builds/src-noconflict/theme-chrome";

export default {
  name: "AceEditor",
  props: {
    value: {
      type: String,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: "javascript",
    },
    // Theme, corresponding theme JS needs to be imported in advance
    theme: {
      tyle: String,
      default: "chrome",
    },
    // Maximum number of lines
    maxLines: Number,
    // Whether to show fullscreen button
    withFullscreenBtn: {
      type: Boolean,
      default: false,
    },
    withFooterBtns: {
      type: Boolean,
      default: false,
    },
  },
  model: {
    prop: "value",
    event: "change",
  },
  mounted() {
    // Initialize Ace editor
    this.aceEditor = ace.edit(this.$refs.ace, {
      // mode: `ace/mode/${this.language}`,
      // theme: `ace/theme/${this.theme}`,
      fontSize: 12,
      tabSize: 2,
      value: this.value, // Value in Ace
      selectionStyle: "text",
      //autoScrollEditorIntoView: true,
      maxLines: this.maxLines,
      readOnly: this.readOnly, // Whether it's read-only
      fontFamily: "Courier New,Courier,Microsoft Yahei", // Font family
    });
    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      wrap: true,
      setShowPrintMargin: false,
    });
    this.aceEditor.session.setMode("ace/mode/text");
    this.aceEditor.setShowPrintMargin(false);
    // Add input event listener for real-time changes
    this.aceEditor.addEventListener("input", this.handleChange, false);
  },
  methods: {
    handleChange() {
      this.$emit("change", this.aceEditor.getValue());
    },
  },
  beforeDestroy() {
    // Remove event listener
    this.aceEditor.removeEventListener("input", this.handleChange, false);
  },
  data() {
    return {
      aceEditor: null,
    };
  },
  watch: {
    value(newVal) {
      if (this.aceEditor.getValue() !== newVal) {
        this.aceEditor.setValue(newVal);
        this.aceEditor.clearSelection();
        this.aceEditor.resize(true);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ace_content {
  min-height: 300px;
}
</style>
