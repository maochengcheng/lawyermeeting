<template>
    <el-popconfirm :title="tip?tip:'确认删除？'" confirmButtonText='是' cancelButtonText='否' @onConfirm="onConfirm" placement="top"> 
      <el-button slot="reference" type="danger" :size="size?size:'mini'" :loading="loading">删除</el-button>
    </el-popconfirm>
</template>
<script>
export default {
    props:['tip','size','loading'],
    methods:{
      onConfirm(){
        this.$emit("delete")
      }
    }
}
</script>
<style scoped>

</style>