import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';

import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

app.mount('#app');
