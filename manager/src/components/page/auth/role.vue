<template>
    <div>
        <List :dataUrl="'auth/role'" @create="createDialog=true" @delete="deleteRole" ref="list" @edit="editRole">
            <template slot="addition-table-actions" slot-scope="scope">
                <el-button type="primary" size="mini" @click="openPermission(scope.item.row)">查看权限</el-button>
            </template>
        </List>

        <el-dialog :title="(role.id?'编辑':'新建')+'角色'" :visible.sync="createDialog" :close-on-click-modal="false" >
            <el-form>
                <el-form-item label="角色名称">
                    <el-input placeholder="角色名称" v-model="role.name"></el-input>
                </el-form-item>
                <el-form-item label="选择权限">
                    <div class="el-input">
                        <permission @checked="onChecked" :role="role.id" :editMode="true"></permission>
                    </div>
                </el-form-item>
                <el-button type="primary" @click="submitRole" :loading="role.loading">保存</el-button>
            </el-form>
        </el-dialog>
        <el-dialog :visible.sync="showPermission" title="查看权限">
            <permission :role="currentRole.id"></permission>
        </el-dialog>
    </div>
</template>

<script>
import List from "../../view/List"
import permission from "./permission"
export default {
    components:{List,permission},
    data(){
        return {
            showPermission:false,
            filter:{bb:"bb"},
            createDialog:false,
            tableData:{},
            tableMeta:{},
            role:{},
            currentRole:{}
        }
    },
    watch:{
        createDialog(val){
            if(val){
                return
            }
            this.role = {}
        }
    },
    methods:{
        onChecked(e){
 
            this.role.permissions= e
        },
        submitRole(){
            let role =  this.role
            if(!role.name){
                this.toast('请输入名称')
                return
            }
            if(!role.permissions || !role.permissions.length){
                this.toast("请选择权限")
                return
            }
            this.selfLoading(this.role,true)
            this.ax.post("auth/role",role).then(it =>{
                this.selfLoading(this.role,false)
                this.createDialog = false
                if(role.id){
                    this.$refs.list.onUpdate([it])
                    this.role = {}
                    return
                }
                this.role = {}
                this.$refs.list.onAdd(it)
                
            })
        },
        editRole(e){
            this.role = Object.assign({},this.role,e[0])
            this.createDialog = true
        },
        openPermission(item){
            this.currentRole = item
            this.showPermission = true
        },
        deleteRole(role){
            this.startLoading()
            this.ax.delete("auth/role?ids="+role.map(it =>{return it.id}).join(",")).then(it =>{
                this.stopLoading()
                this.$refs.list.onDeleted(role)
            }).catch(it =>{
                this.stopLoading()
            })
        }
    }
}
</script>
<style scoped>

</style>