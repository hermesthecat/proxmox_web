<template>
  <div class="base-icon" :style="__style" v-lazy:background-image="__bgImage"></div>
</template>

<script>
import { requireAll2Obj } from "@libs/utils";

let svgs = requireAll2Obj(
  require.context("../../assets/", true, /\.(png|svg|gif)$/)
);
export default {
  name: "BaseIcon",
  props: {
    name: {
      type: String,
      required: true,
      validator: function (value) {
        let svgNames = Object.keys(svgs);
        return svgNames.some((item) => item === value);
      },
    },
    _style: Object,
  },
  computed: {
    __style() {
      return {
        backgroundRepeat: "no-repeat",
        ...this._style,
      };
    },
    __bgImage() {
      return `${svgs[this.name]}`;
    },
  },
};
</script>

<style scoped>
.base-icon {
  display: inline-block;
  height: 36px;
  width: 36px;
  margin-right: 10px;
  vertical-align: middle;
}
</style>
