import Vue from "vue";
import App from "./App.vue";
//import SimpleApp from "./demo/SimpleApp.vue";

Vue.config.productionTip = false;
new Vue({
  //render: (h) => h(SimpleApp),
  render: (h) => h(App),
}).$mount("#app");
