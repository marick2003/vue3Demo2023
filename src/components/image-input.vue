<template>
    <div
    class="image-input"
    :style="{ 'background-image': `url(${imageData})` }"
    @click="chooseImage"
  >
    <span
      v-if="!imageData"
      class="placeholder"
    >
      Choose an Image
    </span>
    <input
      class="file-input"
      ref="fileInput"
      type="file"
      @input="onSelectFile"
    >
  </div>
</template>
<script >
    export default{
        setup(){
            let imageData = null;
            return {imageData};
        }

    }
</script>