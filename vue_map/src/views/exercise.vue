<template>
  <div>
    <el-checkbox v-model="checkAll" @change="handleCheckAllChange($event)">全选</el-checkbox>
    <div style="margin: 15px 0;"></div>
    
      <div v-for="(city, index) in cities" :key="index">
        
        <el-checkbox v-model="city.checked" @change="handleCheckedCitiesChange(city, $event)"></el-checkbox>
        <span :class="currentCity == city.name ? 'actived' : ''">{{city.name}}</span>
      </div>
  </div>
  
</template>
<script>
  export default {
    
    data() {
      return {
        checkAll: false,
        checkedCities: ['上海', '北京'],
        cities:  [
          {
            name: '上海',
            checked: false
          },
          {
            name: '北京',
            checked: false
          },
          {
            name: '南京',
            checked: false
          },
          {
            name: '廊坊',
            checked: false
          }
        ],
        
        currentCity: '',
//        isIndeterminate: true
      };
    },
    methods: {
      handleCheckAllChange(event) {
        console.log(event)
        
        this.cities.forEach((item, index) => {
          console.log(item)
          this.$set(item, 'checked', event)
        })
      },
      handleCheckedCitiesChange(city, event) {
        this.currentCity = city.name;
        this.$set(city, 'checked', event);
        console.log(event)
        
        let arrayCity = [];
        this.cities.forEach((item, index) => {
          if(item.checked){
            arrayCity.push(item);
          }
        })
        this.checkAll = arrayCity.length == this.cities.length;
        },
      handleData(){
      
      }
    }
  };
</script>
<style lang="scss" scoped>
  
  .actived{
    color: blue;
  }
</style>
