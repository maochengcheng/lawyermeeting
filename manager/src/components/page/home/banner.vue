<template>
    <div class="banner">
        <!-- <el-row>
            <el-col>
                <el-table ref="list" :data="banner" v-loading="tableLoading">
                    <el-table-column align="center" label="banner图片">
                        <template slot-scope="scope">
                            <el-image
                                :src="scope.row.path"
                                :fit="'contain'"
                                :preview-src-list="banner.map(it=>{return it.path})"
                                style="width:4rem;height:4rem;"
                            ></el-image>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="排序" prop="serialNumber"></el-table-column>
                    <el-table-column align="center" label="创建时间" prop="time"></el-table-column>
                    <el-table-column align="center" label="操作">
                        <template slot-scope="scope">
                            <el-button type="danger" @click="deleteBanner(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>-->
        <List ref="list" :data="listData" :tableMeta="tableMeta" @delete="deleteBanner">
            <template slot="addition-actions">
                <el-button type="primary" @click="bannerStatus=!bannerStatus">添加</el-button>
            </template>
        </List>

        <el-dialog title="添加轮播图" :visible.sync="bannerStatus" :close-on-click-modal="false">
            <div class="add-banner" v-loading="loading">
                <el-upload
                    class="upload-demo"
                    drag
                    :headers="{
                        accessToken:user.token
                    }"
                    :show-file-list="false"
                    action="/other/upload"
                    :before-upload="handleBeforeUpload"
                    :on-success="handlePictureCardPreview"
                    :on-progress="handlePropgree"
                >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">
                        将图片拖到此处，或
                        <em>点击上传</em>
                    </div>
                    <div class="el-upload__tip" slot="tip">只能上传JPG/PNG文件，最佳比例为：236.67/100（宽/高）</div>
                </el-upload>
                <el-progress :percentage="age" v-if="age"></el-progress>
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
            bannerStatus: false, //保存或编辑banner
            user: '', //用户信息
            banner: [],
            age: 0,
            loading: false,
            tableLoading: false
        };
    },

    created() {
        this.getBanner();
        let user = localStorage.getItem('user');
        this.user = user ? JSON.parse(user) : '';
    },
    // activated() {
    //     this.handleListener();
    // },
    // deactivated() {
    //     window.removeEventListener('resize', this.renderChart);
    //     bus.$off('collapse', this.handleBus);
    // },
    computed: {
        listData() {
            return {
                content: this.banner,
                size: 20,
                totalElements: this.banner.length
            };
        },
        tableMeta() {
            return {
                key: 'banner',
                name: '',
                searchable: false,
                displayInList: false,
                displayName: false,
                delete: 'DELETE',
                edit: 'NONE',
                print: 'NONE',
                export: 'NONE',
                insertable: false,
                deleteKey: 'id',
                subs: [
                    {
                        key: 'path',
                        name: '轮播图图片',
                        searchable: false,
                        displayInList: true,
                        displayName: false,
                        delete: 'DELETE',
                        edit: 'EDIT',
                        print: 'NONE',
                        export: 'NONE',
                        insertable: false,
                        deleteKey: 'id',
                        searchOption: null,
                        type: 'IMAGE',
                        sort: 0,
                        sortable: false,
                        clickable: false
                    },
                    {
                        key: 'serialNumber',
                        name: '排序',
                        searchable: false,
                        displayInList: true,
                        displayName: false,
                        delete: 'DELETE',
                        edit: 'EDIT',
                        print: 'NONE',
                        export: 'NONE',
                        insertable: false,
                        deleteKey: 'id',
                        searchOption: null,
                        type: null,
                        sort: 0,
                        sortable: false,
                        clickable: false
                    },
                    {
                        key: 'time',
                        name: '创建时间',
                        searchable: false,
                        displayInList: true,
                        displayName: false,
                        delete: 'DELETE',
                        edit: 'EDIT',
                        print: 'NONE',
                        export: 'NONE',
                        insertable: false,
                        deleteKey: 'id',
                        searchOption: null,
                        type: 'TIMESTAMP',
                        sort: 0,
                        sortable: false,
                        clickable: false
                    }
                ],
                searchOption: null,
                type: null,
                sort: 0,
                sortable: false,
                clickable: false
            };
        }
    },
    watch: {
        bannerStatus(val) {
            if (!val) {
                this.age = 0;
            }
        }
    },
    methods: {
        /**
         * @description:获取轮播图
         */
        getBanner() {
            this.tableLoading = true;
            this.ax
                .get('home/carousel')
                .then(res => {
                    this.tableLoading = false;
                    let data = res;
                    data.forEach(it => {
                        it.time = this.cn.changeDate(it.createTime, true);
                    });
                    this.banner = data;
                })
                .catch(err => {
                    this.tableLoading = false;
                });
        },
        /**
         * @description:上传成功
         */
        handlePictureCardPreview(file, fileList) {
            this.loading = true;
            let list = this.banner;
            let query = {
                path: file.data,
                presenceStatus: 1,
                serialNumber: list.length + 1
            };

            this.ax
                .post('home/carousel', query)
                .then(res => {
                    this.loading = false;
                    this.$message.success('保存成功');
                    this.bannerStatus = false;
                    this.getBanner();
                })
                .catch(err => {
                    this.loading = false;
                });
         
        },
        /**
         * @description:上传之前
         */
        handleBeforeUpload(file) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            // const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
            }
            // if (!isLt2M) {
            //   this.$message.error('上传头像图片大小不能超过 2MB!');
            // }
            return isJPG;
        },
        /**
         * @description:上传进度
         */
        handlePropgree(e) {
            this.age = e.percent;
        },
        /**
         * @description:删除轮播图
         */
        deleteBanner(list) {
            let item = list[0];

            let query = {
                ids: item.id,
                presenceStatus: 0
            };
            this.ax
                .delete('home/carousel', {
                    params: query
                })
                .then(res => {
                    this.$message.success('删除成功');
                    this.getBanner();
                });
        }
    }
};
</script>


<style scoped>
.el-row {
    margin-bottom: 20px;
}

.grid-content {
    display: flex;
    align-items: center;
    height: 100px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num {
    font-size: 30px;
    font-weight: bold;
}

.grid-con-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.grid-con-1 .grid-con-icon {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
    color: rgb(242, 94, 67);
}

.user-info {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #ccc;
    margin-bottom: 20px;
}

.user-avator {
    width: 120px;
    height: 120px;
    border-radius: 50%;
}

.user-info-cont {
    padding-left: 50px;
    flex: 1;
    font-size: 14px;
    color: #999;
}

.user-info-cont div:first-child {
    font-size: 30px;
    color: #222;
}

.user-info-list {
    font-size: 14px;
    color: #999;
    line-height: 25px;
}

.user-info-list span {
    margin-left: 70px;
}

.mgb20 {
    margin-bottom: 20px;
}

.todo-item {
    font-size: 14px;
}

.todo-item-del {
    text-decoration: line-through;
    color: #999;
}

.schart {
    width: 100%;
    height: 300px;
}
.add-banner {
    text-align: center;
}

/deep/ .el-dialog {
    min-width: 600px;
    max-width: 800px;
}

.posi-rela {
    position: relative;
    text-align: center;
    overflow: hidden;
}
.posi-all {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 999;
}
</style>
