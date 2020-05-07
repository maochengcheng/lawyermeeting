<template>
    <div>
        <List  
        :metaUrl="'user/meta'" 
        :dataUrl="'user'"
        :tableData="tableData" 
        @create="createDialog=true" 
        :tableMeta="tableMeta" 
        :disableTableAction="true"
        :disableAction="true">
        </List>

        <el-dialog title="编辑紧急空间用户">
            <el-form>
                <el-form-item label="用户名">
                    <el-input placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item label="用户头像">
                    
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import List from "../../view/List"
export default {
    components:{List},
    data(){
        return {
            filter:{bb:"bb"},
            createDialog:false,
            tableData:{},
            tableMeta:{}
        }
    },
    methods:{
        getList(item){
            let vm = this
            this.ax.get("user",{params:item}).then(it =>{
               vm.tableData = it
            })
        }
    }
}
</script>
<style scoped>

</style>