<template>
  <div class="bg-white p-10">
    <el-tabs v-model="activeName"> 
      <el-tab-pane :label="item.title" :name="item.title" v-for="item in settings" :key="item.name">
          <setting-page :url="item.url"  :config="item.configs" :name="item.name"></setting-page>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import settingPage  from "./SettingPage.vue"
export default {
  components:{
    settingPage
  },
  data(){
    return {
      activeName: null,
      settings:[]
    }
  },
  created(){
      this.getAllConfig()
  },
  methods:{
    getAllConfig(){
        let vm = this
        this.ax.get("config").then(it =>{
            vm.settings = it
            vm.activeName = it[0].title
        })
    }
  }
}
</script>
