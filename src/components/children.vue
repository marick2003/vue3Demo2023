<template>
    <div>
        {{ "toRef:"+name }}
        {{"toRefs:"+ name2.name }}
        <button v-on:click="$emit('accepted')">OK</button>
    </div>
</template>
<script>
import { toRef,toRefs } from 'vue'
 export default{
    props: ['name'],
    setup(props) {
        const name = toRef(props, 'name');
        const name2 = toRefs(props, 'name');
       
        return {
            name2,
            name
        }
    }
 }
</script>