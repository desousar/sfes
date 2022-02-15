<template>
  <svg
    class="KnotenGlobal"
    :style="{
      left: component.x,
      top: component.y,
      position: 'absolute',
      border: component.selected ? '1px solid red' : ''
    }"
    width="38.21994mm"
    height="105.28967mm"
    viewBox="0 0 38.21994 105.28967"
    sodipodi:docname="Knoten_Potential-Erde.svg"
  >
    <g
      class="knotenClass"
      draggable="false"
      @click="$emit('simpleClick')"
      @dblclick="$emit('doubleClick')"
      @mousedown="$emit('mousedown', $event)"
      @mousemove="$emit('mousemove', $event)"
      @mouseout="$emit('mouseout')"
      inkscape:label="Calque 1"
      inkscape:groupmode="layer"
      id="layer1"
      transform="translate(-131.16922,-322.51897)"
    >
      <circle
        cy="377.92508"
        cx="150.30266"
        id="circle27"
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: #000000;
          stroke-width: 1;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        r="8"
        class="pin"
        @mousedown="ev => $emit('pin', 0)"
        @mouseup="ev => $emit('pinMouseUp', 0)"
      />
    </g>
    <g
      v-if="component.showPotential"
      inkscape:groupmode="layer"
      id="layer2"
      inkscape:label="Calque 2"
      transform="translate(-81.27636,-45.46242)"
    >
      <rect
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: none;
          stroke-width: 1.65945923;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="rect3732"
        width="6"
        height="42"
        x="97.38633"
        y="50.97839"
      />
      <rect
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: none;
          stroke-width: 1.31099999;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="rect3735"
        width="25"
        height="6"
        x="13.613276"
        y="102.6119"
        transform="rotate(-44.181603)"
      />
      <rect
        transform="matrix(-0.71713442,-0.69693488,-0.69693488,0.71713442,0,0)"
        y="-37.313572"
        x="-130.36771"
        height="6"
        width="25"
        id="rect3739"
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: none;
          stroke-width: 1.31099999;
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
          stroke-width: 1.31099999;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="rect3741"
        width="6"
        height="6"
        x="32.830582"
        y="103.12415"
        transform="rotate(-45)"
        inkscape:transform-center-x="-0.1889881"
        inkscape:transform-center-y="-1.6536374"
      />
    </g>
    <g
      v-if="component.showGround"
      inkscape:groupmode="layer"
      id="layer3"
      inkscape:label="Calque 3"
      transform="translate(-81.276361,-45.462418)"
    >
      <path
        style="opacity:1;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1.65945935;stroke-linecap:butt;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
        d="m 97.385628,108.75209 h 6.000002 v 42 h -6.000002 z"
        id="rect3732-0"
        inkscape:connector-curvature="0"
      />
      <path
        transform="rotate(90)"
        style="opacity:1;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1.58302212;stroke-linecap:butt;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
        d="m 144.75209,-119.49631 h 6 v 38.219943 h -6 z"
        id="rect3732-0-5"
        inkscape:connector-curvature="0"
      />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    component: Object
  },
  emits: [
    'simpleClick',
    'dblclick',
    'mouseup',
    'mousedown',
    'mousemove',
    'mouseout',
    'pin',
    'pinMouseUp'
  ]
};
</script>

<style>
.KnotenGlobal {
  width: 25px;
  height: auto;
}
.knotenClass {
  cursor: pointer;
}
</style>
