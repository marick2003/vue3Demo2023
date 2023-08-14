<template>
    <Transition>
        <KeepAlive>
            <Suspense>
                <template #default>
                <imgItem></imgItem>
                </template>
        
                <template #fallback> Loading... </template>
            </Suspense>
        </KeepAlive>
    </Transition>
  </template>
<script>
import imgItem from "./test.vue";
export default {
 setup(){
    return {}
 },
 components:{
    imgItem
 }

}

</script>