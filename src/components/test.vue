
<script>
import axios from "axios";
export default {
  async setup() {
    const res = await axios.get("https://api.nuxtjs.dev/mountains");
    return {
      photoArr: res.data,
    };
  },
};
</script>
<template>
  <img
    class="img"
    v-for="item in photoArr"
    :key="item.title"
    :src="item.image"
    alt=""
  />
</template>

<style scpoed>
.img {
  display: block;
  width: 300px;
  margin: 0 auto 10px auto;
}
</style>