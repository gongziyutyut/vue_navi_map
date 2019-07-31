<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <div @click="send">点击请求</div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  },
  methods: {
    send () {
      this.$http({
        method: 'post',
        url: 'api/centralizedpriced/distribution/taskList',
        data: {
          projectId: ''
        },
        headers: {token: ''}
      })
    }
  }
}
</script>
