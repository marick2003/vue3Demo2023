<template>
    <div class="column" style="width: 300px;">
      <q-btn @click="sendEventImage ()" style="margin-top: 16px; margin-bottom: 32px;" outline color="white" text-color="black" label="Procurar imagem" />
      <input :style="'display:none'" ref="EventfileInput" @change="onEventFilePicked" type="file" name="upload" accept="image/*" />
      <q-img class="w-30 h-30" :src="imageUrl" />
    </div>
</template>

<script>

import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'FileUpload',
  emits: ['imageloaded'],
  setup (props, { emit }) {
      const imageUrl = ref('');
      const EventfileInput = ref(null);
        
      const onEventFilePicked = (event) => {
          const files = event.target.files
          const image = files[0]
          console.log(image)
          const filename = files[0].name
          if (filename.lastIndexOf('.') <= 0) {
            return alert('Por favor adicione um arquivo válido')
          }
          const fileReader = new FileReader()
          fileReader.addEventListener('load', (event) => {
            imageUrl.value = fileReader.result
            console.log('setimageUrl', imageUrl.value)
            emit('imageloaded',imageUrl.value);
          })
          fileReader.readAsDataURL(files[0])
      };
      const sendEventImage = () => {

          if (EventfileInput.value) {
                EventfileInput.value.click();
            }
      };
      return {
          imageUrl,
          sendEventImage,
          onEventFilePicked,
          EventfileInput
      }
  }
})
</script>