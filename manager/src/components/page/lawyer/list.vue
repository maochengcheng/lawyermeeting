<template>
    <div>
        <List
            :dataUrl="'attorneyManagement/attorney'"
            :metaUrl="'attorneyManagement/meta'"
            @delete="deleteLawyer"
            ref="list"
            :data="listData"
            @data="changeData"
            @meta="onMeta"
            :tableMeta="tableMeta"
        >
            <template slot="addition-actions">
                <el-button type="primary" @click="outExcel">导出Excel</el-button>
            </template>
            <template slot="addition-table-actions" slot-scope="scope">
                <el-button type="primary" @click="edit(scope.item.row)">编辑</el-button>
            </template>
        </List>
        <el-dialog
            title="编辑律师信息"
            class="edit-modal"
            :visible.sync="showEdit"
            width="35%"
            :close-one-click-modal="false"
        >
            <div class="one-line">
                <div class="w-40">
                    <div class="m-b-10">姓名:</div>
                    <el-input v-model="editLay.name" placeholder="请输入姓名"></el-input>
                </div>
                <div class="w-40">
                    <div class="m-b-10">性别:</div>
                    <el-select v-model="editLay.gender">
                        <el-option value="MALE" label="男"></el-option>
                        <el-option value="FEMALE" label="女"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="one-line">
                <div class="w-40">
                    <div class="m-b-10">手机号:</div>
                    <el-input v-model="editLay.phone" placeholder="请输入手机号"></el-input>
                </div>
                <div class="w-40">
                    <div class="m-b-10">身份证号:</div>
                    <el-input v-model="editLay.idNumber" placeholder="请输入身份证号"></el-input>
                </div>
            </div>
            <div class="one-line">
                <div class="w-40">
                    <div class="m-b-10">律师证号:</div>
                    <el-input v-model="editLay.licenseNumber" placeholder="请输入律师证号"></el-input>
                </div>
                <div class="w-40">
                    <div class="m-b-10">律师事务所:</div>
                    <el-input v-model="editLay.lawOffice" placeholder="请输入事务所名称"></el-input>
                </div>
            </div>
            <div class="one-line">
                <div>
                    <div class="m-b-10">律师执业证（请上传年审页）:</div>
                    <div class="img-list" v-loading.fullscreen.lock="uploading">
                        <div
                            class="img-item"
                            v-for="(item,index) in editLay.qualifications "
                            :key="index"
                        >
                            <el-image
                                :src="item"
                                fit="cover"
                                :preview-src-list="editLay.qualifications"
                            ></el-image>
                            <i class="icon el-icon-error close" @click="del(index)"></i>
                        </div>
                        <el-upload
                            action="/other/upload"
                            :before-upload="beforeUpload"
                            :on-success="handSuccess"
                            :show-file-list="false"
                            v-if="!editLay.qualifications || editLay.qualifications.length<3"
                        >
                            <i class="el-icon-plus"></i>
                        </el-upload>
                    </div>
                </div>
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
            currentLawyer: '',
            listData: {},
            editLay: {},
            showEdit: false,
            uploading: false
        };
    },
    watch: {},
    methods: {
        /**
         * @description:更改列表中的删除状态
         */
        onMeta(e) {
            e.delete = 'DELETE_BOTH';
            e.edit = '';
            this.tableMeta = e;
        },
        /**
         * @description:更改字段
         */
        changeData(e) {
            let data = e;
            data.content.forEach(it => {
                it.gender = it.gender == 'MALE' ? '男' : it.gender == 'FEMALE' ? '女' : '';
            });
            this.listData = data;
        },
        /**
         * @description:删除律师
         */
        deleteLawyer(item) {
            this.startLoading();
            this.ax
                .delete(
                    'attorneyManagement/attorney?ids=' +
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
         * @description:导出Excel
         */
        outExcel() {
            this.ax.get('attorneyManagement/exportAttorneyExcel').then(res => {
                let data = res;

                let name = data.split('/')[1];
                var link = document.createElement('a');
                link.download = name;
                link.style.display = 'none';
                link.href = this.httpUrl + data;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        },
        /**
         * @description:编辑律师信息
         */
        edit(e) {
            let item = JSON.parse(JSON.stringify(e));
            item.qualifications = item.qualifications.map(it => {
                return it.path;
            });
            item.gender = item.gender == '女' ? 'FEMALE' : 'MALE';
            this.currentLawyer = item;
            this.showEdit = true;
            this.editLay = {
                ...item
            };
        },
        /**
         * @description:上传图片之前
         */
        beforeUpload(file) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
            }
            this.uploading = true;
            return isJPG;
        },
        /**
         * @description:上传成功
         */
        handSuccess(file, fileList) {
            let lay = JSON.parse(JSON.stringify(this.editLay));
            if (!lay.qualifications) {
                lay.qualifications = [];
            }
            lay.qualifications.push(file.data);
            this.editLay = lay;
            this.uploading = false;
        },
        /**
         * @description:删除图片
         */
        del(index) {
            this.uploading = true;
            let lay = JSON.parse(JSON.stringify(this.editLay));
            lay.qualifications.splice(index, 1);
            this.editLay = lay;
            setTimeout(() => {
                this.uploading = false;
            }, 500);
        },

        /**
         * @description:保存律师修改
         */
        saveEdit() {
            let lay = JSON.parse(JSON.stringify(this.editLay));
            let err = '';
            // if (!/^[\u4e00-\u9fa5]{2,20}$/.test(lay.lawOffice)) {
            //     err = '请输入正确的事务所名称';
            // }
            if (!/^[0-9]*$/.test(lay.licenseNumber) || lay.licenseNumber.length != 17) {
                err = '请输入正确的律师证号';
            }
            if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(lay.idNumber)) {
                err = '请输入正确的身份证号';
            }
            if (!/^1[3456789]\d{9}$/g.test(lay.phone)) {
                err = '请输入正确的手机号';
            }
            if (!/^[\u4e00-\u9fa5]{2,20}$/.test(lay.name)) {
                err = '请输入正确的姓名';
            }
            if (!lay.qualifications || !lay.qualifications.length) {
                err = '请上传律师执业证';
            }
            if (!lay.lawOffice) {
                err = '请输入律师事务所名称';
            }
            if (!lay.licenseNumber) {
                err = '请输入律师证号';
            }
            if (!lay.idNumber) {
                err = '请输入身份证号';
            }
            if (!lay.phone) {
                err = '请输入手机号';
            }
            if (!lay.name) {
                err = '请输入姓名';
            }
            if (err) {
                this.$message.error(err);
                return;
            }
            this.saveIng = true;
            lay.gender = lay.gender;
            lay.qualifications = lay.qualifications.map(it => {
                return {
                    attorneyId: lay.id,
                    path: it,
                    type: 1
                };
            });
            this.ax
                .post('attorneyManagement/updateAttorney', lay)
                .then(res => {
                    this.$message.success('修改成功');
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