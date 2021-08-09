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
    sodipodi:docname="CurrentSource.svg"
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
      inkscape:cx="169.77604"
      inkscape:cy="60.949795"
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
        v-if="component.showUdir0Temp || component.showUdir0"
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
        v-if="component.showUdir1Temp || component.showUdir1"
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
        v-if="component.showIdir1Temp || component.showIdir1"
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
        id="ItoRight"
        v-if="component.showIdir0Temp || component.showIdir0"
        transform="rotate(-180,45.911158,24.361321)"
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
        transform="translate(-14.300098,-257.79749)"
        id="comp"
        inkscape:label="Calque 1"
      >
        <rect
          y="286"
          x="77.326859"
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
          x="19.07"
          y="286"
        />
        <circle
          v-if="component.showPin1"
          class="pin"
          r="2.3447022"
          cy="287"
          cx="17.299999"
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
          @mousedown="ev => $emit('pin', 0)"
          @mouseup="ev => $emit('pinMouseUp', 0)"
          r="5"
          cy="287"
          cx="17.299999"
          id="pin1EasyToClick"
          style="opacity: 0;"
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
          cx="103.7"
          cy="287"
        />
        <circle
          v-if="component.showPin2"
          class="pin"
          @mousedown="ev => $emit('pin', 1)"
          @mouseup="ev => $emit('pinMouseUp', 1)"
          r="5"
          style="opacity: 0;"
          id="pin2EasyToClick"
          cx="103.7"
          cy="287"
        />
        <circle
          r="16.85"
          cy="287.05344"
          cx="60.602982"
          id="pin1-1"
          style="
            opacity: 1;
            fill: #ffffff;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 1.31059587;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
        />
        <rect
          transform="rotate(90)"
          style="
            opacity: 1;
            fill: #000000;
            fill-opacity: 1;
            stroke: none;
            stroke-width: 1.03492868;
            stroke-linecap: butt;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="rect833-1"
          width="34.274475"
          height="1.3099999"
          x="269.81723"
          y="-61.258003"
        />
      </g>
    </g>
  </svg>
</template>

<script>
import BaseComp from '../MixinKompo/Base2PinsKompo';
export default {
  mixins: [BaseComp]
};
</script>
