<template>
    <div>
        <List
            :metaUrl="'user/meta'"
            :dataUrl="'user/emergence'"
            @create="createUserDialog=true"
            @meta="onMeta"
            @delete="deleteUser"
            @edit="editUser"
            ref="list"
            :tableMeta="tableMeta">
            <template slot="addition-table-actions" slot-scope="scope">
                <el-button size="mini" type="primary" @click="editConversation(scope.item.row)">编辑聊天</el-button>
            </template>
        </List>

        <el-dialog title="编辑紧急空间用户" :visible.sync="createUserDialog" :close-on-click-modal="false">
            <el-form>
                <el-form-item label="用户名">
                    <el-input placeholder="用户名" v-model="newUser.name"></el-input>
                </el-form-item>

                <el-form-item label="用户头像">
                    <div class="el-input avatar-uploader">
                    <el-upload
                        action="/manage/media/image"
                        :show-file-list="false"
                        :headers="uploadHeader"
                        name="image"
                        :on-success="handleAvatarSuccess">
                        <img v-if="newUser.avatar" :src="newUser.avatar" class="avatar" />
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    
                    </div>
                </el-form-item>
                <el-button type="primary" :loading="newUser.loading" @click="addUser">保存</el-button>
            </el-form>
        </el-dialog>
        <el-dialog title="编辑聊天" :visible.sync="editChatDialog" :close-on-click-modal="false">
            <div style="height:20rem;padding:10px;overflow: scroll;">
                <div v-for="(chat,index) in currentEditItem.chats" :key="chat.id" :style="{'text-align':chat.direction =='SEND'?'right':'left'}" >
                    <div class="flex-row" :class="{'flex-end':chat.direction =='SEND'}">
                        <el-button type="danger" icon="el-icon-delete" circle v-if="chat.direction =='SEND'" class="delete-button" @click="deleteChat(chat,index)"></el-button>
                    <div class="chat-item">
                          
                        {{chat.content}}
                    </div>
                    <el-button type="danger" icon="el-icon-delete" circle v-if="chat.direction =='RECEIVE'" class="delete-button" @click="deleteChat(chat,index)"></el-button>
                    </div>
                </div>
                <div v-if="currentEditItem.chats && !currentEditItem.chats.length">暂无聊天</div>
            </div>
            <div class="flex-row">
                        <el-select v-model="newChat.direction">
                            <el-option value="SEND" label="发送">发送</el-option>
                            <el-option value="RECEIVE" label="接收">接收</el-option>
                    </el-select>
                    <el-input placeholder="内容" style="margin:0 10px" v-model="newChat.content"></el-input>
                    <el-button type="primary" :loading="newChat.loading" @click="saveChat">保存</el-button>
            </div>
            
        </el-dialog>
    </div>
</template>

<script>
import List from '../../view/List';
export default {
    components: { List },
    data() {
        return {
            createUserDialog: false,
            editChatDialog:false,
            tableMeta: {},
            uploadHeader:{
                platform:"MANAGER",
                accessToken: JSON.parse(localStorage.getItem("user")).token
            },
            newUser:{
                name: null,
                avatar: null
            },
            newChat:{
                content: null,
                direction: "SEND"
            },
            currentEditItem:{}
        };
    },
    methods: {
        editConversation(item) {
          
            this.startLoading()
            this.ax.get("user/emergence/chat/"+item.chatUserId).then(it =>{
                item.chats = it
                this.currentEditItem = item
                this.editChatDialog = true
                this.stopLoading()
            }).catch(it =>{
                this.stopLoading()
            })
            // this.$router.push({ name: 'emergencyChat' });
        },
        onMeta(meta) {
            meta.subs = meta.subs.filter(it => {
                if (it.key === 'country') {
                    it.displayInList = false;
                    it.searchable = false;
                }
                return true;
            });
            meta.edit = 'EDIT_NONE';
            meta.delete = 'DELETE_BOTH';
            this.tableMeta = meta;
        },
        handleAvatarSuccess(e){
            if(e.code == 200){
                this.newUser.avatar = e.value
            }else{
                this.toast("上传失败:"+e.msg)
            }
        },
        editUser(e){
          
            let user = e[0]
            this.newUser.name = user.nickname
            this.newUser.avatar  =user.avatar
            this.newUser.id = user.id
            this.createUserDialog = true
        },
        addUser(){
            let user = this.newUser
            if(!user.name){
                this.toast("请输入用户名")
                return
            }
            if(!user.avatar){
                this.toast("请选择头像")
                return
            }
            this.selfLoading(this.newUser,true)
            this.ax.post("user/emergence?name="+user.name+"&avatar="+user.avatar).then(it =>{
                this.selfLoading(this.newUser,false)
                this.createUserDialog = false
                if(user.id){
                    this.$refs.list.onUpdate([it])
                }
                this.$refs.list.onAdd(it)
            }).catch(()=>{
                this.selfLoading(this.newUser,false)
            })
        },
        saveChat(){
            let chat =  this.newChat
            if(!chat.content){
                this.toast("请填写内容")
                return
            }
            chat.chatUserId = this.currentEditItem.chatUserId
            this.selfLoading(this.newChat,true)
            this.ax.post("user/emergence/chat",chat).then(it =>{
                this.currentEditItem.chats.push(it)
                this.newChat.content = null
                this.selfLoading(this.newChat,false)
            }).catch(()=>{
                this.selfLoading(this.newChat,false)
            })
        },
        deleteChat(item,index){
            this.startLoading()
            this.ax.delete("user/emergence/chat/"+item.id).then(it =>{
                this.stopLoading()
                this.currentEditItem.chats.splice(index,1)
                this.$forceUpdate()
            }).catch(()=>{
                this.stopLoading()
            })
        },
        deleteUser(e){
         
            this.startLoading()
            this.ax.delete("user/emergence?ids="+e.map(it=>{return it.id}).join(",")).then(it =>{
                this.stopLoading()
                this.$refs.list.onDeleted(e)
            }).catch(e=>{
                this.stopLoading()
            })
        },
    }
};
</script>
<style scoped>
 .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .chat-item{
      display: inline-block;
      background: #C0C4CC;
      padding: 10px;
      margin-bottom: 30px;
      
  }
  .delete-button{
      width: 2rem;
      height: 2rem;
      margin: 0 10px;
  }
  .flex-end{
      justify-content: flex-end;
  }
</style>