<template>
    <div>
        <List
            :dataUrl="'detentionCenter/detentionCenter'"
            :metaUrl="'detentionCenter/meta'"
            @delete="deleteLawyer"
            ref="list"
            :data="listData"
            @data="editData"
            @meta="onMeta"
            @create="createDentention"
            :tableMeta="tableMeta"
        >
            <template slot="addition-table-actions" slot-scope="scope">
                <el-button type="primary" @click="edit(scope.item.row)">编辑</el-button>
                <el-button
                    type="primary"
                    @click="freeze(scope.item.row)"
                >{{scope.item.row.freeze=='正常'?'冻结':"解冻"}}</el-button>
            </template>
        </List>
        <el-dialog
            :title="editLay.id?'编辑单位':'添加单位'"
            class="edit-modal"
            :visible.sync="showEdit"
            width="35%"
            :close-one-click-modal="false"
        >
            <div class="m-b-10">
                <div class="m-b-10">单位名称:</div>
                <el-input v-model="editLay.name" placeholder="请输入单位名称"></el-input>
            </div>
            <div class="m-b-10">
                <div class="m-b-10">备注:</div>
                <el-input
                    type="textarea"
                    resize="none"
                    rows="5"
                    v-model="editLay.note"
                    placeholder="请输入备注"
                ></el-input>
            </div>
            <div class="one-line">
                <div></div>
                <div>
                    <el-button @click="showEdit=!showEdit" v-loading="saveIng">取消</el-button>
                    <el-button type="primary" v-loading="saveIng" @click="saveEdit">保存</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import List from '../../view/List';
import deleteBtn from '../../view/DeleteButton';

export default {
    components: { List, deleteBtn },
    data() {
        return {
            saveIng: false,
            tableMeta: {},
            listData: {},
            editLay: {}, //弹窗内容
            showEdit: false,
            uploading: false
        };
    },
    watch: {},
    methods: {
        freeze(item) {
            this.$confirm('此操作将' + (item.freeze == '正常' ? '冻结' : '解冻') + '该单位, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let query = {
                    id: item.id,
                    freeze: item.freeze == '正常' ? 0 : 1
                };
                this.ax.post('detentionCenter/detentionCenterFreeze', query).then(res => {
                    this.$message.success('操作成功');
                    this.$refs.list.doSearch();
                });
            });
        },
        editData(e) {
            e.content.forEach(it => {
                it.freeze = it.freeze ? '正常' : '冻结';
            });
            this.listData = e;
            console.log(e);
        },
        /**
         * @description:创建一个单位。
         * */
        createDentention() {
            this.showEdit = true;
            this.editLay = {};
        },
        /**
         * @description:更改列表中的删除状态
         */
        onMeta(e) {
            e.delete = 'DELETE_BOTH';
            e.edit = '';
            this.tableMeta = e;
        },
        /**
         * @description:删除单位
         */
        deleteLawyer(item) {
            this.startLoading();
            this.ax
                .delete(
                    'detentionCenter/detentionCenter?ids=' +
                        item
                            .map(it => {
                                return it.id;
                            })
                            .join(',')
                )
                .then(it => {
                    this.stopLoading();
                    this.$refs.list.onDeleted(item);
                })
                .catch(it => {
                    this.stopLoading();
                });
        },
        /**
         * @description:编辑单位信息
         */
        edit(e) {
            let item = JSON.parse(JSON.stringify(e));
            this.showEdit = true;
            this.editLay = item;
        },

        /**
         * @description:保存单位修改
         */
        saveEdit() {
            let lay = JSON.parse(JSON.stringify(this.editLay));
            let err = '';
            // if (!/^[\u4e00-\u9fa5]{2,20}$/.test(lay.name)) {
            //     err = '请输入正确的姓名';
            // }
            if (!lay.note) {
                err = '请输入备注';
            }
            if (!lay.name) {
                err = '请输入姓名';
            }
            if (err) {
                this.$message.error(err);
                return;
            }
            lay.presenceStatus = 1;
            this.saveIng = true;
            this.ax
                .post('detentionCenter/detentionCenter', lay)
                .then(res => {
                    this.$message.success(lay.id ? '修改成功' : '添加成功');
                    this.saveIng = false;
                    this.showEdit = false;
                    this.$refs.list.doSearch();
                })
                .catch(err => {
                    this.saveIng = false;
                });
        }
    }
};
</script>
<style lang="less" scoped>
/deep/ .el-dialog {
    min-width: 600px;
}
.edit-modal {
    .one-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .img-list {
        display: flex;
        flex-wrap: wrap;
        transition: all 0.5s;
        max-height: 400px;
        padding: 10px;
        box-sizing: border-box;
        overflow: auto;
        /deep/.el-upload,
        .el-image,
        .img-item {
            width: 10rem;
            height: 10rem;
            line-height: 10rem;
        }
        /deep/.el-image {
            border-radius: 6px;
            border: 1px solid rgba(64, 158, 255, 1);
            box-sizing: border-box;
        }
        .img-item {
            margin-right: 10px;
            margin-bottom: 10px;
            position: relative;
            transition: all 0.5s;
        }
        .close {
            color: rgba(64, 158, 255, 1);
            font-size: 20px;
            position: absolute;
            right: -8px;
            top: -8px;
            cursor: pointer;
        }
    }
}
</style>