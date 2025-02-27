<template>
  <div :class="{ 'pop-up': true, show: show }" :data-id="_uid">
    <div class="popup-mask" v-if="hasMark"></div>
    <transition name="bottom">
      <div class="popup-note bottom">
        <div class="pop-content animate__backInLeft" ref="pop-wrapper" :style="contentStyles">
          <div class="pop-tit" ref="pop-header" @mousedown="handleMoveStart">
            {{ title }}
            <span class="pop-close" @click.prevent="noClick">&times;</span>
          </div>
          <p class="pop-note hasTitle">
            <base-icon :name="icon" v-if="icon" />
            <slot>
              <p v-if="!dangerouslyUseHTMLString" style="display: inline-block; width: calc(100% - 80px)">
                {{ msg }}
              </p>
              <p v-else v-html="msg" style="display: inline-block; width: calc(100% - 80px)"></p>
            </slot>
          </p>
          <div class="btn-wrapper" v-if="type == 'alert'">
            <m-button class="confirm-btn" type="primary" @on-click="alertClick">{{ alertBtnText }}</m-button>
          </div>
          <div class="btn-wrapper">
            <m-button class="confirm-btn" type="danger" @on-click="noClick">{{
              noBtnText
            }}</m-button>
            <m-button class="confirm-btn" type="primary" @on-click="yesClick"
              v-if="['confirm', 'info', 'warning'].includes(type)">{{ yesBtnText }}</m-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
// Icon component
import BaseIcon from "../icon/BaseIcon";
import { getDocument } from "@libs/utils";

export default {
  components: { BaseIcon },
  props: {
    title: {
      type: String,
      default: "Tip",
    },
    msg: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "alert",
    },
    alertBtnText: {
      type: String,
      default: "I understand",
    },
    yesBtnText: {
      type: String,
      default: "Confirm",
    },
    noBtnText: {
      type: String,
      default: "Cancel",
    },
    hasMark: {
      type: Boolean,
      default: true,
    },
    isClose: {
      type: Boolean,
      default: true,
    },
    icon: String,
    _style: Object,
  },
  computed: {
    // Calculate message box position
    contentStyles() {
      let style = {};
      style.left = `${this.mouseEndPoint.left}px`;
      style.top = `${this.mouseEndPoint.top}px`;
      return Object.assign({}, style, this._style);
    },
  },
  data() {
    return {
      promiseStatus: null, // Alert click status
      show: false, // Whether to show alert
      isMounted: false, // Whether already in mounting phase
      draggable: true,
      mouseStartPoint: { left: 0, top: 0 },
      mouseEndPoint: {
        left: getDocument().clientWidth / 2,
        top: getDocument().clientHeight / 2,
      },
      mouseDragDown: false,
      basePoint: { left: 0, top: 0 },
      moveTarget: null,
      dangerouslyUseHTMLString: false,
    };
  },
  mounted() {
    let _this = this;
    _this.isMounted = true;
    _this.draggable = _this.drag ? _this.drag : true;
  },
  methods: {
    confirm() {
      let _this = this;
      this.show = true;
      return new Promise(function (resolve, reject) {
        _this.promiseStatus = { resolve, reject };
      });
    },
    // Callback triggered when clicking cancel
    noClick() {
      this.show = false;
      this.promiseStatus && this.promiseStatus.reject();
      document.body.removeChild(this.$el);
      document.body.classList.toggle("hidden");
    },
    // Callback triggered when clicking confirm
    yesClick() {
      this.show = false;
      this.promiseStatus && this.promiseStatus.resolve();
      if (!this.isClose) return;
      this.close();
    },
    // Callback triggered when clicking close
    close() {
      document.body.removeChild(this.$el);
      document.body.classList.toggle("hidden");
    },
    // Callback triggered when clicking alert box
    alertClick() {
      this.show = false;
      this.promiseStatus && this.promiseStatus.resolve();
      if (!this.isClose) return;
      this.close();
    },
    handleMoveStart(event) {
      var dragDom = this.$refs["pop-header"];
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
      event.preventDefault();
      event.stopPropagation();
    },

    handleMoveMove(event) {
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
      let minX = this.$refs["pop-wrapper"].clientWidth / 2;
      let maxX =
        getDocument().clientWidth - this.$refs["pop-wrapper"].clientWidth / 2;
      if (left <= minX) {
        left = minX;
      } else if (left >= maxX) {
        left = maxX;
      }
      // Get minimum and maximum Y-axis positions of dialog in page
      let minY = this.$refs["pop-wrapper"].clientHeight / 2;
      let maxY =
        getDocument().clientHeight - this.$refs["pop-wrapper"].clientHeight / 2;
      if (top <= minY) {
        top = minY;
      } else if (top >= maxY) {
        top = maxY;
      }
      this.mouseEndPoint = { left: left, top: top };
      event.preventDefault();
      event.stopPropagation();
    },

    handleMoveEnd(event) {
      this.mouseDragDown = false;
      this.moveTarget = null;
      // Remove mouse move event listener
      document.removeEventListener("mousemove", this.handleMoveMove);
      // Remove mouse down event listener
      document.removeEventListener("mousedown", this.handleMoveStart);
      // Prevent default event behavior
      event.preventDefault();
      // Prevent event bubbling
      event.stopPropagation();
    },
  },
  watch: {
    msg: {
      handler: function (newVal, oldVal) {
        if (newVal !== oldVal) return newVal;
      },
      deep: true,
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/components/confirm/confirm.less";

/deep/ .base-icon {
  display: inline-block;
  height: 36px;
  width: 50px;
  margin-right: 10px;
  background-size: 36px 36px;
  background-repeat: no-repeat;
  vertical-align: top;
}
</style>
