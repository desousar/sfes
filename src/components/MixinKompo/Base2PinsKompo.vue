<script>
export default {
  props: {
    component: Object
  },
  methods: {
    horizontalOrVerticalClass: function() {
      return {
        componentDeg0: this.component.rotation === 0,
        componentDeg90: this.component.rotation === 90,
        componentDeg180: this.component.rotation === 180,
        componentDeg270: this.component.rotation === 270
      };
    }
  }
};
</script>

<style scoped>
.pin {
  cursor: crosshair;
}

/*size of a 2 pins component*/
.component {
  height: /*63.33px;*/ auto;
  width: 100px;
}
.cursorPointer {
  cursor: pointer;
}
.componentDeg0 {
  transform-origin: center center;
  transform: rotate(0deg);
}
.componentDeg90 {
  transform-origin: center center;
  transform: rotate(90deg);
}
.componentDeg180 {
  transform-origin: center center;
  transform: rotate(180deg);
}
.componentDeg270 {
  transform-origin: center center;
  transform: rotate(270deg);
}

/* CSS inside SVG */

.fillgrey {
  fill: #9e9e9e;
}
</style>
