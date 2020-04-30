<template>
    <div class="p-10 bg-white">
        <List 
            :tableData="tableData" 
            :actionName="'发布更新'"
            :metaUrl="'app/meta'" 
            :dataUrl="'app'"
            @edit="editUpdate"
            ref="list"
            @delete="deleteUpdate"
            @create="publishDialog =true">
        </List>
        <el-dialog title="发布更新" :visible.sync="publishDialog" :close-on-click-modal="false" @close="updateItem=null">
            <div>
                <template v-if="!updateItem">
                    <el-upload
                        class="upload-demo"
                        drag
                        action="/manage/app/apk"
                        :on-success="onUploadSuccess"
                        multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">
                            将文件拖到此处，或
                            <em>点击上传</em>
                        </div>
                        <div class="el-upload__tip" slot="tip">只能上传apk文件</div>
                    </el-upload>
                </template>
                <template v-else>
                    <el-form>
                        <el-form-item label="应用名称">
                            <el-input :value="updateItem.appName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="版本号">
                            <el-input :value="updateItem.versionCode" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="版本名称">
                            <el-input :value="updateItem.versionName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="更新日志">
                            <el-input v-model="updateItem.changelog" type="textarea" :autosize="true" :rows="6"></el-input>
                        </el-form-item>
                        <el-button
                            type="primary"
                            @click="publishUpdate"
                            :loading="updateItem.loading"
                        >确认发布</el-button>
                    </el-form>
                </template>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import DeleteButton  from "../../view/DeleteButton"
import List from '../../view/List'
export default {
    components:{DeleteButton,List},
    data() {
        return {
            publishDialog: false,
            pageTotal: 100,
            query: {
                address: '',
                name: '',
                pageIndex: 1,
                pageSize: 20
            },
            tableData: {content:[],meta:{}},
            updateItem: null,
            pageInfo:{}
        };
    },
    created() {
        this.getList();
    },
    methods: {
        onUploadSuccess(res) {
         
            if (res.code != 200) {
                this.toast(res.msg);
                return;
            }
            this.toast('上传成功', 'success');
            this.updateItem = res.value;
        },
        getList(pageInfo) {
            let vm = this;
            this.ax.get('app',{params:pageInfo}).then(it => {
                vm.pageInfo = it
                vm.tableData.content = it.content;
            });
        },
        publishUpdate() {
            if (!this.updateItem.changelog) {
                this.toast('请输入更新日志');
                return;
            }
            this.selfLoading(this.updateItem, true);
            let vm  = this
            this.ax.post('app/publish', this.updateItem).then(it => {
                vm.selfLoading(vm.updateItem,false)
                vm.toast("发布成功","success")
                vm.publishDialog = false
            
                if(vm.updateItem.id || vm.updateItem.id ==0){
                    this.$refs.list.onUpdate([it])
                    vm.updateItem = null
                    return
                }
                vm.updateItem = null
                this.$refs.list.onAdd(it)
                
            });
        },
        editUpdate(e){
            this.updateItem = Object.assign({},this.updateItem,e[0])
            this.publishDialog = true
        },
        deleteUpdate(e){
            this.startLoading()
            this.ax.delete('app?ids='+e.map(it =>{return it.id}).join(",")).then(it =>{
                this.stopLoading()
                this.$refs.list.onDeleted(e)
            }).catch(it =>{
                this.stopLoading()
            })
        }
    }
};
</script>
<style scoped>
</style>