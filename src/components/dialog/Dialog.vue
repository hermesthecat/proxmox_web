<template>
  <div
    class="dialog"
    v-if="visible"
    ref="dialog"
    :key="key"
    :class="{ show: visible }"
  >
    <div class="dialog-mask"></div>
    <div class="dialog-wrapper">
      <div
        class="dialog-content animate__backInLeft animate__backOutRight"
        ref="pop-wrapper"
        :style="contentStyles"
      >
        <div
          class="dialog-header"
          ref="pop-header"
          @mousedown.stop="handleMoveStart"
        >
          <span class="dialog-title">{{ title }}</span>
          <span class="dialog-close" @click="close">&times;</span>
        </div>
        <div class="dialog-main">
          <slot name="content"></slot>
        </div>
        <div class="dialog-footer">
          <template v-if="!$slots['footer']">
            <m-button type="danger" class="dialog-cancel" @on-click="cancel">{{
              cancelText
            }}</m-button>
            <m-button type="primary" class="dialog-confirm" @on-click="ok">{{
              confirmText
            }}</m-button>
          </template>
          <template v-else>
            <slot name="footer"></slot>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocument } from "@libs/utils";
import MScrollbar from "@src/components/scroll/Scrollbar";
export default {
  name: "Dialog",
  components: {
    MScrollbar,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    cancelText: {
      type: String,
      default: "Cancel",
    },
    confirmText: {
      type: String,
      default: "Confirm",
    },
    _style: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
    drag: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      promiseStatus: null,
      isMounted: false,
      draggable: true,
      mouseStartPoint: { left: 0, top: 0 },
      mouseEndPoint: {
        left: getDocument().clientWidth / 2,
        top: getDocument().clientHeight / 2,
      },
      mouseDragDown: false,
      basePoint: { left: 0, top: 0 },
      moveTarget: null,
      appendToBody: true,
      key: 1,
      interval: null,
    };
  },
  computed: {
    // Calculate the position where the dialog appears
    contentStyles() {
      let style = {};
      style.left = `${this.mouseEndPoint.left}px`;
      style.top = `${this.mouseEndPoint.top}px`;
      return Object.assign({}, style, this._style);
    },
  },
  methods: {
    // Close dialog callback
    close() {
      let _this = this;
      _this.show = false;
      this.interval = setTimeout(() => {
        _this.$emit("close");
        _this.closed = true;
        if (this.appendToBody) {
          document.body.removeChild(this.$el);
        }
      }, 0);
    },
    // Click cancel callback
    cancel() {
      let _this = this;
      this.$emit("cancel");
    },
    ok() {
      let _this = this;
      this.$emit("confirm");
    },
    handleMoveStart(event) {
      var dragDom = this.$refs["pop-header"];
      if (this.$refs["dialog"]) this.$refs["dialog"].classList.toggle("move");
      // Prevent selected DOM content from being selected
      dragDom.onselectstart = dragDom.ondrag = function () {
        return false;
      };
      if (!this.draggable) return;
      if (event.target.hasOwnProperty("close"))
        // Cannot move dialog when clicking close button
        return;
      // Check if movable
      this.mouseDragDown = true;
      // Starting x-axis position when moving
      this.mouseStartPoint.left = Number(
        this.$refs["pop-wrapper"].style.left.replace(/px/, "")
      );
      // Starting y-axis position when moving
      this.mouseStartPoint.top = Number(
        this.$refs["pop-wrapper"].style.top.replace(/px/, "")
      );
      // Move target
      this.moveTarget = this.$refs["pop-wrapper"];
      // Starting move position
      this.basePoint = { left: event.pageX, top: event.pageY };
      // Listen for move event
      document.addEventListener("mousemove", this.handleMoveMove, false);
      // Listen for mouse up event
      document.addEventListener("mouseup", this.handleMoveEnd, false);
    },

    handleMoveMove(event) {
      event.preventDefault();
      event.stopPropagation();
      if (!this.mouseDragDown || this.moveTarget == undefined) return;
      // X-axis movement distance
      var mousX = event.pageX - this.basePoint.left;
      // Y-axis movement distance
      var mousY = event.pageY - this.basePoint.top;
      // Distance from starting position on x-axis
      let left = mousX + this.mouseStartPoint.left;
      // Distance from starting position on y-axis
      let top = mousY + this.mouseStartPoint.top;
      // If absolute value of left or top is less than or equal to 0, no movement occurred
      if (Math.abs(left) <= 0 || Math.abs(top) <= 0) return;
      // offsetWidth, offsetHeight: current element width
      // innerWidth, innerHeight: browser viewport width and height

      // Get minimum and maximum X-axis positions of dialog in page
      let minX = 0;
      let maxX =
        getDocument().clientWidth - this.$refs["pop-wrapper"].clientWidth;
      if (left <= minX) {
        left = minX;
      } else if (left >= maxX) {
        left = maxX;
      }
      // Get minimum and maximum Y-axis positions of dialog in page
      let minY = 0;
      // Minimum top value is 0
      let maxY =
        getDocument().clientHeight - this.$refs["pop-wrapper"].clientHeight < 0
          ? 0
          : getDocument().clientHeight - this.$refs["pop-wrapper"].clientHeight;
      if (top <= minY) {
        top = minY;
      } else if (top >= maxY) {
        top = maxY;
      }
      this.mouseEndPoint = { left: left, top: top };
    },

    handleMoveEnd(event) {
      this.mouseDragDown = false;
      this.moveTarget = null;
      // Remove mouse move event listener
      document.removeEventListener("mousemove", this.handleMoveMove);
      // Remove mouse down event listener
      document.removeEventListener("mousedown", this.handleMoveStart);
      if (this.$refs["dialog"]) this.$refs["dialog"].classList.toggle("move");
      // Prevent default event behavior
      event.preventDefault();
      // Prevent event bubbling
      event.stopPropagation();
    },
  },
  mounted() {
    let _this = this;
    _this.isMounted = true;
    _this.draggable = _this.drag ? _this.drag : true;
    if (this.appendToBody) {
      document.body.appendChild(this.$el);
    }
    // Initialize dialog position in viewport
    if (_this.$refs["pop-wrapper"])
      _this.mouseEndPoint = {
        left:
          (getDocument().clientWidth - _this.$refs["pop-wrapper"].clientWidth) /
          2,
        top: 100,
      };
  },
  destroyed() {
    if (this.interval !== null) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.closed = false;
        this.$emit("open");
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
        this.$nextTick(() => {
          this.$refs.dialog.scrollTop = 0;
          this.mouseEndPoint = {
            left:
              (getDocument().clientWidth -
                this.$refs["pop-wrapper"].clientWidth) /
              2,
            top:
              (getDocument().clientHeight -
                this.$refs["pop-wrapper"].clientHeight) /
              2,
          };
        });
        return val;
      } else {
        if (!this.closed) this.$emit("close");
        if (this.destroyOnClose) {
          this.$nextTick(() => {
            this.key++;
          });
        }
        return val;
      }
    },
  },
};
</script>

<style scoped lang="less">
@import "~@src/components/dialog/dialog.less";
</style>
