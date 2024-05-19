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
    draggable="false"
    @click="$emit('simpleClick')"
    @dblclick="$emit('doubleClick')"
    @mousedown="$emit('mousedown', $event)"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    width="92.4002mm"
    height="35.010597mm"
    viewBox="0 0 92.4002 35.010597"
    version="1.1"
    id="svg8"
    inkscape:version="0.92.4 (5da689c313, 2019-01-14)"
    sodipodi:docname="Inductor.svg"
  >
    <defs id="defs2">
      <mask
        maskUnits="objectBoundingBox"
        id="mask63"
      >
        <rect
          style="
            opacity: 1;
            fill: #ffffff;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 1.37346816;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="rect65"
          width="50.487621"
          height="10.999932"
          x="35.505119"
          y="256.98712"
        />
      </mask>
    </defs>
    <sodipodi:namedview
      id="base"
      pagecolor="#ffffff"
      borderColor="#666666"
      borderopacity="1.0"
      inkscape:pageopacity="0.0"
      inkscape:pageshadow="2"
      inkscape:zoom="2.8284271"
      inkscape:cx="176.71841"
      inkscape:cy="68.864483"
      inkscape:document-units="mm"
      inkscape:current-layer="layer1"
      showgrid="false"
      inkscape:window-width="1920"
      inkscape:window-height="1001"
      inkscape:window-x="-9"
      inkscape:window-y="-9"
      inkscape:window-maximized="1"
      fit-margin-top="0"
      fit-margin-left="0"
      fit-margin-right="0"
      fit-margin-bottom="0"
    />
    <metadata id="metadata5">
      <rdf:RDF>
        <cc:Work rdf:about>
          <dc:format>image/svg+xml</dc:format>
          <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
          <dc:title />
        </cc:Work>
      </rdf:RDF>
    </metadata>
    <g
      inkscape:label="Calque 1"
      inkscape:groupmode="layer"
      id="layer1"
      transform="translate(-14.299999,-269.54814)"
    >
      <rect
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: none;
          stroke-width: 0.84267151;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="rect831"
        width="22.723047"
        height="2"
        x="79.261627"
        y="286"
      />
      <rect
        y="286"
        x="19.07"
        height="2"
        width="22.474998"
        id="rect833"
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: none;
          stroke-width: 0.83805948;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
      />
      <circle
        v-if="component.showPin1"
        style="
          opacity: 1;
          fill: transparent;
          fill-opacity: 1;
          stroke: #000000;
          stroke-width: 1.31059575;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="pin1"
        cx="17.299999"
        cy="287"
        r="2.3447022"
        class="pin"
        @click="(ev) => $emit('pin', 'pin1', 0, ev)"
      />
      <circle
        v-if="component.showPin2"
        cy="287"
        cx="103.7"
        id="pin2"
        style="
          opacity: 1;
          fill: transparent;
          fill-opacity: 1;
          stroke: #000000;
          stroke-width: 1.31099999;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        r="2.3447022"
        class="pin"
        @click="(ev) => $emit('pin', 'pin2', 1, ev)"
      />
      <g
        id="g3971"
        transform="matrix(0.99034179,0,0,1.0000061,5.1719386,20.012284)"
        mask="url(#mask63)"
      >
        <ellipse
          ry="8.9992123"
          rx="4.799212"
          cy="266.99835"
          cx="41.278126"
          id="path3742-2"
          style="
            opacity: 1;
            fill: none;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 2.00157571;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <ellipse
          ry="8.8825483"
          rx="4.8573017"
          cy="267.0787"
          cx="50.940777"
          id="path3742-2-8"
          style="
            opacity: 1;
            fill: none;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 2.01939631;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <ellipse
          ry="8.8825483"
          rx="4.8573017"
          cy="267.10208"
          cx="60.651691"
          id="path3742-2-9"
          style="
            opacity: 1;
            fill: none;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 2.01939631;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <ellipse
          ry="8.8825483"
          rx="4.8573017"
          cy="267.08557"
          cx="70.37513"
          id="path3742-2-5"
          style="
            opacity: 1;
            fill: none;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 2.01939631;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
      </g>
    </g>
  </svg>
</template>

<!-- not used so not updated -->
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
  ],
  methods: {
    horizontalOrVerticalClass: function () {
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
@import './../cssFolder/comp.css';
</style>
