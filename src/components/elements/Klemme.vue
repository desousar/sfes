<template>
  <svg
    class="klemmeGlobal"
    :style="{
      left: component.x,
      top: component.y,
      position: 'absolute'
    }"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    width="17mm"
    height="17mm"
    viewBox="0 0 17 17"
    version="1.1"
    id="svg8"
    inkscape:version="0.92.4 (5da689c313, 2019-01-14)"
    sodipodi:docname="KlemmeVue.svg"
  >
    <defs id="defs2" />
    <sodipodi:namedview
      id="base"
      pagecolor="#ffffff"
      borderColor="#666666"
      borderopacity="1.0"
      inkscape:pageopacity="0.0"
      inkscape:pageshadow="2"
      inkscape:zoom="2.8284271"
      inkscape:cx="-16.426563"
      inkscape:cy="-7.9041631"
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
      class="klemmeClass"
      draggable="false"
      @click="$emit('simpleClick')"
      @dblclick="$emit('doubleClick')"
      @mousedown="$emit('mousedown', $event)"
      @mousemove="$emit('mousemove', $event)"
      @mouseout="$emit('mouseout')"
      inkscape:label="Calque 1"
      inkscape:groupmode="layer"
      id="layer1"
      transform="translate(-52.000099,-278.55344)"
    >
      <circle
        r="8"
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
        @mousedown="ev => $emit('pin', 0)"
        @mouseup="ev => $emit('pinMouseUp', 0)"
      />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    component: Object
  }
};
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
