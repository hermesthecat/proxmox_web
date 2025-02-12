<template>
  <div class="state">
    <div class="state-dot" :class="__class"></div>
    <div class="state-content">{{ content }}</div>
  </div>
</template>
<script>
// Table state component
export default {
  name: "InfoState",
  props: {
    state: {
      type: String,
      default: "normal",
    },
    content: {
      type: String,
      default: "",
    },
  },
  computed: {
    // Compute different class names based on state, different colors for different states
    __class() {
      return {
        actived: this.state === "actived",
        unactived: this.state === "unActived",
        online: this.state === "online",
        unLine: this.state === "unLine",
        unknown: this.state === "unknown",
        running: this.state === "running",
        stopped: this.state === "stopped",
        dead: this.state === "dead",
        stopped: this.state === "stop",
      };
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/components/table/infoState.less";
</style>
