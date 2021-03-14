<template>
  <!--@mousedown="(e) => $emit('mousedown', e)" comme ca pas besoin de $ à envent-->
  <svg
    class="component"
    v-bind:class="horizontalOrVerticalClass()"
    :style="{
      left: component.x,
      top: component.y,
      position: 'absolute',
      border: component.selected ? '1px solid red' : '',
    }"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    width="92.4002mm"
    height="58.510792mm"
    viewBox="0 0 92.400199 58.510792"
    version="1.1"
    id="svg8"
    inkscape:version="0.92.4 (5da689c313, 2019-01-14)"
    sodipodi:docname="Resistor.svg"
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
      inkscape:cx="110.01368"
      inkscape:cy="64.20994"
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
      class="cursorPointer"
      draggable="false"
      @click="$emit('simpleClick')"
      @dblclick="$emit('doubleClick')"
      @mousedown="$emit('mousedown', $event)"
      @mousemove="$emit('mousemove', $event)"
      @mouseout="$emit('mouseout')"
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
        id="ItoLeft"
        v-if="component.showIdir1"
        transform="translate(-3.133659,9.7881856)"
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
        id="ItoRight"
        transform="rotate(-180,47.763239,24.361321)"
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

      <g id="comp">
        <rect
          y="28.202511"
          x="69.310616"
          height="2"
          width="18.373959"
          id="rect831"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 0.75775075;
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
            stroke-width: 0.75638556;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="rect833"
          width="18.307812"
          height="2"
          x="4.7699018"
          y="28.202511"
        />
        <circle
          v-if="component.showPin1"
          @click="(ev) => $emit('pin', 0)"
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
          v-if="component.showPin2"
          @click="(ev) => $emit('pin', 1)"
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
        <rect
          style="
            opacity: 1;
            fill: #ffffff;
            stroke: #000000;
            stroke-width: 2;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="rect819"
          width="48.000248"
          height="18.000246"
          x="22.199877"
          y="20.255291"
        />
      </g>
    </g>
  </svg>
</template> 

<script>
import BaseComp from "../MixinKompo/Base2PinsKompo";
export default {
  mixins: [BaseComp],
};
</script>

