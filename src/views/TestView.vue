<template>
    <div class="column" style="width: 300px;">
      <q-btn @click="sendEventImage ()" style="margin-top: 16px; margin-bottom: 32px;" outline color="white" text-color="black" label="Procurar imagem" />
      <input :style="'display:none'" ref="EventfileInput" @change="onEventFilePicked" type="file" name="upload" accept="image/*" />
      <q-img class="w-30 h-30" :src="imageUrl" />
    </div>
    <SuspenseTestItem > </SuspenseTestItem>
    <MyTable :tableHeads="tableHeads" :tableBody="tableBody">
      <template #ithelpLink="{ index, props, value }">
          <a :href="tableBody[index].ithelpLink" target="_blank"> 查看 </a>
      </template>
    </MyTable>
    
</template>

<script>
import SuspenseTestItem from '../components/Suspense.vue';
import MyTable from '../components/MyTable.vue'
import { defineComponent, ref } from 'vue'


export default defineComponent({
  name: 'FileUpload',
  emits: ['imageloaded'],
  setup (props, { emit }) {
      const imageUrl = ref('');
      const EventfileInput = ref(null);
      //原本的，練習用
      const tableHeads = ref(['姓名', '主題', '備註', '查看'])
      const tableBody = ref([
        {
          name: 'Angela',
          topic: '真的好想離開 Vue 3 新手村',
          note: 'Composition API',
          ithelpLink: 'https://ithelp.ithome.com.tw/users/20152606/ironman/5782',
        },
        {
          name: '阿傑',
          topic: '咩色用得好，歸剛沒煩惱',
          note: '從 ECMAScript 偷窺 JavaScript Array method',
          ithelpLink: 'https://ithelp.ithome.com.tw/users/20152459/ironman/5744',
        },
        {
          name: 'Jade',
          topic: '前端蛇行撞牆記',
          note: '無',
          ithelpLink: 'https://ithelp.ithome.com.tw/users/20152424/articles',
        },
        {
          name: 'Vic',
          topic: 'JavaScript 之路，往前邁進吧！',
          note: '未來會成為JS大師的人。',
          ithelpLink: 'https://ithelp.ithome.com.tw/users/20151114/ironman/5425',
        },
      ])
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
          EventfileInput,
          tableHeads,
          tableBody
      }
  },components:{
    MyTable,
    SuspenseTestItem,
  }
})
</script>