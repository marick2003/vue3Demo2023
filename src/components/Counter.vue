<template>
    <h1>{{"Compostition Js" }}</h1>
    <p>count:{{ count }}</p>
    <p>double:{{ double }}</p>
    <button @click="increment">click me</button>
</template>
<script>
import Counter from "@/utils/Counter.js";
export default{
    setup(){
        const { count,double,increment} = Counter();
        return {
            count,
            double,
            increment,
        }
    }
}
</script>