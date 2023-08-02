<!-- <script setup>
// 
</script> -->

<template>
  <main>
    <button type="button" v-show="!isEdit" @click="()=>{return isEdit=!isEdit;}">
       open
    </button>
    <Counter></Counter>
    <br/>
    <input v-model="message">
    <Child/>
  </main>
</template>

<script>
import { ref, reactive, provide } from "vue";
import TheWelcome from '../components/TheWelcome.vue'
import Counter from '../components/Counter.vue';
import Child from '../components/Child.vue'
export default {
  setup() {
      let isEdit = ref(false);
      const products = ref([]);
      const message = ref('hello')
      provide('message', message);
      const userData = reactive({
          name: '',
          age: '',
          address: '',
      })
      return { isEdit, products, userData,message }
  },
  components:{
    Counter:Counter,
    Child,
  }
};
</script>