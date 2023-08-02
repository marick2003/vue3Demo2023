<script setup>
import Children from './children.vue'
defineProps({
  msg: {
    type: String,
    required: true
  }
 
  
})
const parentMsg = 'Hello World';
const accepted=(val)=>{
    page.value=val
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
    <Children :name="parentMsg" :accepted="accepted"></Children>
  </div>
</template>
<!-- // https://juejin.cn/post/7046940339621330974 test--> 
<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
