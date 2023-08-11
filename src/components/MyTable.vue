

<template>
  <table>
    <thead>
      <th></th>
      <th v-for="tableHead in props.tableHeads" :key="tableHead">
        {{ tableHead }}
      </th>
    </thead>
    <tbody>
      <tr v-for="(item, itemIndex) in props.tableBody" :key="item.name">
        <th>{{ itemIndex + 1 }}</th>
        <td v-for="(value, key, index) in item" :key="value">
          <span v-if="!Object.keys($slots).includes(key)">
            {{ value }}
          </span>
          <slot v-else :name="key" :value="value" :index="itemIndex" :props="props"></slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import { useSlots } from 'vue'
export default{
    props:['tableHeads','tableBody'],
    setup(props) {
        const slots = useSlots()
        return {slots,props}
    }

}
</script>