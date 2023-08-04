import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from "vue-i18n";
import App from './App.vue'
import router from './router'
import zh from "@/assets/language/zh-TW.json";
import en from "@/assets/language/en-US.json";
import ja from "@/assets/language/ja-JP.json";
import { Quasar } from 'quasar';
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
// Import Quasar css
import 'quasar/src/css/index.sass'
const  i18n= createI18n({
    globalInjection: true, // 全域注入，讓你在 <template> 可以使用 $t
    legacy: false, // 讓你可以在 composition API 中使用
    locale: localStorage.getItem("locale") ?? "zh-TW",
    fallbackLocale: "zh-TW",
    messages: {
      "zh-TW": zh,
      "en-US": en,
      "ja-JP": ja
    }
  });
const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(Quasar)
app.mount('#app')
