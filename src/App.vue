

<template>
  <header>
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
      <nav>
        <select v-model="locale">
          <option>zh-TW</option>
          <option>en-US</option>
          <option>ja-JP</option>
        </select>
      </nav>
        <p>{{ $t("cancel") }}</p>
        <p>{{ $t("email") }}</p>
        <p>{{ $t("date") }}</p>
        <p>{{ $t("subject") }}</p>
        <p>{{ $t("message") }}</p>
        <p>{{ $t("upload") }}</p>
    </div>
  </header>
    
  <RouterView />
</template>
<script>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { GenerateBets } from '@/assets/lib/kuaiyi.js';
import { watch } from "vue";
import { useI18n } from "vue-i18n";
  export default {
   
    mounted(){
      var currentCommand = {
        Bet: '餐',
        Query: '查',
        NewPlayer: '開始點餐',
      };
      let txt='餐 0XX0 0XX1 = 100';
      let inputBetString = txt.substring(txt.indexOf(currentCommand.Bet) + 1);
      console.log(this.formatString(inputBetString))
      inputBetString=this.formatString(inputBetString);

      let correctedBetString = '';
      let inputBetStringArray = inputBetString.split('\n');
      inputBetString = inputBetString.replace(/ /gm, '');
      inputBetStringArray.forEach((line, index) => {
          if (
            !line.startsWith('=') &&
            index > 0 &&
            line.length > 0 &&
            correctedBetString.length > 0
          ) {
            correctedBetString += ',';
          }
          correctedBetString += line;
        });
        console.log(correctedBetString);
        const bets = GenerateBets(correctedBetString, 0);
        console.log(bets);
    }
  ,methods: {
    formatString(str){

      var regex = /\s*=\s*/g;
      var newStr = str.replace(regex, '=');
      var regex2 = /(\S)\s(\S)/g;
      var newStr2 = newStr.replace(regex2, '$1,$2');
      return newStr2;
    }
  },
  components:{
    HelloWorld
  },
  setup() {
        const { t, locale } = useI18n();
        watch(locale, (newlocale) => {
            localStorage.setItem("locale", newlocale);
        });
    
        return {
          t,
          locale,
        }
  },
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
