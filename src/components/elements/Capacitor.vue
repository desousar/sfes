<template>
  <svg
    class="component"
    v-bind:class="horizontalOrVerticalClass()"
    :style="{
      left: component.x,
      top: component.y,
      position: 'absolute',
      border: component.selected ? '1px solid red' : '',
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
    sodipodi:docname="Capacitor.svg"
  >
    <defs id="defs2" />
    <sodipodi:namedview
      id="base"
      pagecolor="#ffffff"
      borderColor="#666666"
      borderopacity="1.0"
      inkscape:pageopacity="0.0"
      inkscape:pageshadow="2"
      inkscape:zoom="2"
      inkscape:cx="139.22376"
      inkscape:cy="43.648657"
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
          stroke-width: 1.05282176;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
        id="rect831"
        width="35.469875"
        height="2"
        x="66.514801"
        y="286"
      />
      <rect
        y="286"
        x="19.07"
        height="2"
        width="36.619804"
        id="rect833"
        style="
          opacity: 1;
          fill: #000000;
          fill-opacity: 1;
          stroke: none;
          stroke-width: 1.06975174;
          stroke-linecap: butt;
          stroke-miterlimit: 4;
          stroke-dasharray: none;
          stroke-opacity: 1;
        "
      />

      <g
        transform="matrix(1.5647717,0,0,1.7505241,-31.324254,-215.35)"
        id="g30"
      >
        <rect
          transform="rotate(90)"
          y="-56.517448"
          x="277"
          height="2"
          width="20"
          id="rect819-5"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 2.08367252;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="matrix(0,1,1,0,0,0)"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 2.08367252;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="rect821"
          width="20"
          height="2"
          x="277"
          y="61"
        />
      </g>

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
    </g>
  </svg>
</template> 

<script>
import BaseComp from "../MixinKompo/Base2PinsKompo";
export default {
  mixins: [BaseComp],
};
</script>

