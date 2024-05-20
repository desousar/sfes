<template>
  <svg
    class="klemmeGlobal"
    :style="{
      left: component.x,
      top: component.y,
      position: 'absolute',
      border: component.selected ? '1px solid red' : ''
    }"
    width="17mm"
    height="17mm"
    viewBox="0 0 17 17"
    sodipodi:docname="KlemmeVue.svg"
  >
    <g
      class="klemmeClass"
      draggable="false"
      @click="emit('simpleClick')"
      @dblclick="emit('doubleClick')"
      @mousedown="emit('mousedown', $event)"
      @mousemove="emit('mousemove', $event)"
      @mouseout="emit('mouseout')"
      inkscape:label="Calque 1"
      inkscape:groupmode="layer"
      id="layer1"
      transform="translate(-52.000099,-278.55344)"
    >
      <circle
        r="10"
        style="
          opacity: 1;
          fill: #ffffff;
          fill-opacity: 1;
          stroke: #000000;
          stroke-width: 1;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="pin"
        cx="60.500099"
        cy="287.05344"
        class="pin"
        @mousedown="(ev) => emit('pin', 0)"
        @mouseup="(ev) => emit('pinMouseUp', 0)"
      />
    </g>
  </svg>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  component: Object
});

const emit = defineEmits([
  'simpleClick',
  'dblclick',
  'mouseup',
  'mousedown',
  'mousemove',
  'mouseout',
  'pin',
  'pinMouseUp'
]);
</script>

<style>
.klemmeGlobal {
  height: auto;
  width: 12px;
}
.klemmeClass {
  cursor: pointer;
}
</style>
