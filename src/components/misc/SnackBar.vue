<template>
  <div class="snack-bar-wrap" :style="style.wrap">
    <template v-for="(msg, i) in msgs" :key="i">
      <div class="snack-bar" :style="style.bar(msg.color)" @click="pop(i)">
        {{ msg.msg.message || msg.msg }}
      </div>
      <br />
    </template>
  </div>
</template>

<script lang="ts">
const getStyle = (
  baseSize: string,
  position: { pos: string; textAlign: string },
) => {
  const c = (f: number) => `calc(${f} * ${baseSize})`;
  const { pos, textAlign } = position;
  return {
    wrap: {
      position: "fixed",
      left: 0,
      pos: pos ? pos : c(0.05),
      zIndex: 9999,
      width: "100%",
      padding: `0 ${c(0.2)}`,
      pointerEvents: "none",
      textAlign,
    },
    bar: (bg: string) => ({
      display: "inline-block",
      width: "auto",
      minWidth: baseSize,
      maxWidth: `calc(100vw - ${c(0.4)})`,
      padding: `${c(0.15)} ${c(0.2)}`,
      margin: `0 0 ${c(0.05)}`,
      borderRadius: c(0.02),
      lineHeight: c(0.2),
      color: "#fff",
      background: bg,
      boxShadow: `0 ${c(0.01)} ${c(0.025)} rgba(0,0,0, .15)`,
      cursor: "pointer",
      textAlign: "center",
      pointerEvents: "all",
      userSelect: "none",
    }),
  };
};
import { defineComponent } from "vue";
export default defineComponent({
  name: "SnackBar",
  props: {
    colors: {
      default: () => ({
        open: "#333",
        info: "#3DBD7D",
        error: "#FA7377",
        warn: "#FF6600",
      }),
      type: Object,
    },
    position: { default: "top-center", type: String },
    holdTime: { default: 5000, type: Number },
  },
  data() {
    return {
      msgs: [] as Array<{
        color: string;
        msg: string;
        timer: ReturnType<typeof setTimeout> | undefined;
      }>,
      baseSize: "5rem",
    };
  },
  computed: {
    $_position(): { pos: string; textAlign: string } {
      const [p, textAlign] = this.position.toString().split("-");
      return {
        pos: ["top", "bottom"].includes(p) ? p : "top",
        textAlign: ["left", "center", "right"].includes(textAlign)
          ? textAlign
          : "center",
      };
    },
    style(): {
      wrap: {
        position: string;
        left: number;
        pos: string;
        zIndex: number;
        width: string;
        padding: string;
        pointerEvents: string;
        textAlign: string;
      };
      bar: (bg: string) => {
        display: string;
        width: string;
        minWidth: string;
        maxWidth: string;
        padding: string;
        margin: string;
        borderRadius: string;
        lineHeight: string;
        color: string;
        background: string;
        boxShadow: string;
        cursor: string;
        textAlign: string;
        pointerEvents: string;
        userSelect: string;
      };
    } {
      return getStyle(this.baseSize, this.$_position);
    },
  },
  methods: {
    info(msg: string): boolean {
      const color = this.colors.info;
      this.open({ color, msg }, false);
      return true;
    },
    error(msg: string): boolean {
      const color = this.colors.error;
      this.open({ color, msg }, false);
      return false;
    },
    warn(msg: string): boolean {
      const color = this.colors.warn;
      this.open({ color, msg }, false);
      return true;
    },
    open(
      message: { color: string; msg: string } | string,
      isOpen = true,
    ): boolean {
      let msg;
      let color;
      if (!isOpen) {
        color = (message as { color: string; msg: string }).color;
        msg = (message as { color: string; msg: string }).msg;
      } else {
        color = this.colors.open;
        msg = message as string;
      }
      const msgObj = {
        color,
        msg,
        timer: setTimeout(this.pop, this.holdTime),
      };

      this.msgs.push(msgObj);

      return true;
    },
    pop(i = 0): void {
      if (this.msgs[i]) clearTimeout(this.msgs[i].timer as unknown as number);
      this.msgs.splice(i, 1);
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .snack-bar-wrap {
    bottom: 0px;
  }
}
</style>
