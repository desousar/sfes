<template>
  <svg
    class="component"
    v-bind:class="horizontalOrVerticalClass()"
    :style="{
      left: component.x,
      top: component.y,
      position: 'absolute',
      border: component.selected ? '1px solid red' : ''
    }"
    width="92.4002mm"
    height="58.510792mm"
    viewBox="0 0 92.400199 58.510792"
    sodipodi:docname="Ampermeter.svg"
  >
    <g
      class="cursorPointer"
      draggable="false"
      @click="emit('simpleClick')"
      @dblclick="emit('doubleClick')"
      @mousedown="emit('mousedown', $event)"
      @mousemove="emit('mousemove', $event)"
      @mouseout="emit('mouseout')"
      inkscape:label="Calque 1"
      inkscape:groupmode="layer"
      id="layer1"
      transform="translate(9.8882149e-5,-1.7841281e-5)"
    >
      <g
        id="UtoRight"
        v-if="component.showUdir0"
        transform="translate(0.65481216,1.3096236)"
      >
        <rect
          y="3.6401412"
          x="23.557274"
          height="1.8520833"
          width="43.97583"
          id="rect3742"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.81537193;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(45)"
          y="-45.179146"
          x="43.327084"
          height="1.8520833"
          width="7"
          id="rect3742-7"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="49.784618"
          x="36.869526"
          height="1.8520833"
          width="7"
          id="rect3742-7-1"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="UtoRightTemp"
        v-if="component.showUdir0Temp"
        transform="translate(0.65481216,1.3096236)"
      >
        <rect
          y="3.6401412"
          x="23.557274"
          height="1.8520833"
          width="43.97583"
          id="rect3742"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.81537193;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(45)"
          y="-45.179146"
          x="43.327084"
          height="1.8520833"
          width="7"
          id="rect3742-7"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="49.784618"
          x="36.869526"
          height="1.8520833"
          width="7"
          id="rect3742-7-1"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="UtoLeft"
        v-if="component.showUdir1"
        transform="translate(-0.19843819,18.855771)"
      >
        <rect
          y="-13.906006"
          x="24.410524"
          height="1.8520833"
          width="43.97583"
          id="rect3742-4"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.81537193;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(45)"
          y="-27.636343"
          x="8.7374372"
          height="1.8520833"
          width="7"
          id="rect3742-7-7"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="7.4278164"
          x="27.093878"
          height="1.8520833"
          width="7"
          id="rect3742-7-1-6"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="UtoLeftTemp"
        v-if="component.showUdir1Temp"
        transform="translate(-0.19843819,18.855771)"
      >
        <rect
          y="-13.906006"
          x="24.410524"
          height="1.8520833"
          width="43.97583"
          id="rect3742-4"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.81537193;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(45)"
          y="-27.636343"
          x="8.7374372"
          height="1.8520833"
          width="7"
          id="rect3742-7-7"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="7.4278164"
          x="27.093878"
          height="1.8520833"
          width="7"
          id="rect3742-7-1-6"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="ItoLeft"
        v-if="component.showIdir1"
        transform="translate(0.57050781,9.7881856)"
      >
        <rect
          transform="rotate(45)"
          y="2.9347496"
          x="24.053604"
          height="1.8520833"
          width="7"
          id="rect3742-7-7-9"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="22.743984"
          x="-3.4772148"
          height="1.8520833"
          width="7"
          id="rect3742-7-1-6-0"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="ItoLeftTemp"
        v-if="component.showIdir1Temp"
        transform="translate(0.57050781,9.7881856)"
      >
        <rect
          transform="rotate(45)"
          y="2.9347496"
          x="24.053604"
          height="1.8520833"
          width="7"
          id="rect3742-7-7-9"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="22.743984"
          x="-3.4772148"
          height="1.8520833"
          width="7"
          id="rect3742-7-1-6-0"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="ItoRight"
        transform="rotate(-180,45.911158,24.361321)"
        v-if="component.showIdir0"
      >
        <rect
          transform="rotate(45)"
          y="2.9347496"
          x="24.053604"
          height="1.8520833"
          width="7"
          id="rect3742-7-7-9-7"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="22.743984"
          x="-3.4772148"
          height="1.8520833"
          width="7"
          id="rect3742-7-1-6-0-2"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
      <g
        id="ItoRightTemp"
        transform="rotate(-180,45.911158,24.361321)"
        v-if="component.showIdir0Temp"
      >
        <rect
          transform="rotate(45)"
          y="2.9347496"
          x="24.053604"
          height="1.8520833"
          width="7"
          id="rect3742-7-7-9-7"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177572;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(-45)"
          y="22.743984"
          x="-3.4772148"
          height="1.8520833"
          width="7"
          id="rect3742-7-1-6-0-2"
          class="fillgrey"
          style="
            opacity: 1;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.43177575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>

      <g id="comp">
        <rect
          y="28.202511"
          x="63.02676"
          height="2"
          width="24.657812"
          id="rect831"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.87781358;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.88016516;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="rect833"
          width="24.790104"
          height="2"
          x="4.7699018"
          y="28.202511"
        />
        <circle
          v-if="component.showPin1"
          class="pin"
          r="2.3447022"
          cy="29.202511"
          cx="2.9999013"
          id="pin1"
          style="
            opacity: 1;
            fill: #ffffff;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 1.31059575;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <circle
          v-if="component.showPin1"
          class="pin"
          @mousedown="(ev) => emit('pin', 0)"
          @mouseup="(ev) => emit('pinMouseUp', 0)"
          r="10"
          cy="29.202511"
          cx="2.9999013"
          id="pin1EasyToClick"
          style="opacity: 0"
        />
        <circle
          v-if="component.showPin2"
          class="pin"
          r="2.3447022"
          style="
            opacity: 1;
            fill: #ffffff;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 1.31099999;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="pin2"
          cx="89.399902"
          cy="29.202511"
        />
        <circle
          v-if="component.showPin2"
          class="pin"
          @mousedown="(ev) => emit('pin', 1)"
          @mouseup="(ev) => emit('pinMouseUp', 1)"
          r="10"
          style="opacity: 0"
          id="pin2EasyToClick"
          cx="89.399902"
          cy="29.202511"
        />
        <g
          transform="matrix(0.92326627,0,0,0.92114494,-22.896588,-210.2039)"
          id="g824"
        >
          <circle
            style="
              opacity: 1;
              fill: #ffffff;
              fill-opacity: 1;
              stroke: #000000;
              stroke-width: 2;
              stroke-linecap: butt;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="path819"
            cx="74.839287"
            cy="259.95834"
            r="17.953869"
          />
          <text
            xml:space="preserve"
            style="
              font-style: normal;
              font-weight: normal;
              font-size: 29.2886219px;
              line-height: 1.25;
              font-family: sans-serif;
              letter-spacing: 0px;
              word-spacing: 0px;
              fill: #000000;
              fill-opacity: 1;
              stroke: none;
              stroke-width: 0.3050898;
            "
            x="64.981529"
            y="269.40771"
            id="text817"
          >
            <tspan
              sodipodi:role="line"
              id="tspan815"
              x="64.981529"
              y="269.40771"
              style="font-size: 29.2886219px; stroke-width: 0.3050898"
            >
              A
            </tspan>
          </text>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
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

function horizontalOrVerticalClass() {
  return {
    componentDeg0: props.component.rotation === 0,
    componentDeg90: props.component.rotation === 90,
    componentDeg180: props.component.rotation === 180,
    componentDeg270: props.component.rotation === 270
  };
}
</script>

<style scoped>
@import './../cssFolder/comp.css';
</style>
