<template>
    <el-container class="bg-white">
        <el-header height="auto" ref="tableHeader">
            <el-row class="bg-white">
                <el-col :span="20" class="table-action flex-row flex-wrap">
                    <el-input placeholder="请输入律师名" v-model="attorneyName" clearable></el-input>
                    <!-- <el-date-picker
                        v-model="searchTime"
                        value-format="timestamp"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="创建开始时间"
                        end-placeholder="创建结束日期"
                    ></el-date-picker>
                    <el-select v-model="searchStatus" clearable placeholder="请选择预约状态">
                        <el-option
                            v-for="option in options"
                            :key="option.key"
                            :value="option.key"
                            :label="option.name"
                        ></el-option>
                    </el-select>-->
                    <el-button type="primary" @click="getData()">筛选</el-button>
                </el-col>
                <el-col :span="4" class="flex-row end table-action"></el-col>
            </el-row>
        </el-header>
        <el-main :style="'height:'+tableHeight+'px;overflow:scroll'">
            <div class="bg-white" style="height:100%">
                <el-table ref="list" border :data="listData" v-loading="tableLoading">
                    <el-table-column label="律师姓名" prop="attorneyName"></el-table-column>
                    <el-table-column label="律师证号" prop="attorneyId"></el-table-column>
                    <el-table-column label="身份证号" prop="idNumber"></el-table-column>
                    <el-table-column label="系统违约次数" prop="violationNumber"></el-table-column>
                    <el-table-column label="人工设置违约数" prop="artificialViolation"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="edit(scope.row)">编辑违约次数</el-button>
                            <el-button type="primary" @click="list(scope.row)">查看违约记录</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-main>
        <el-footer ref="tableFooter" class="flex-row between flex-center">
            <div></div>
            <div class="pagination" v-if="listData">
                <el-pagination
                    background
                    layout="sizes,total, prev, pager, next"
                    :current-page="pageNum"
                    :page-sizes="[20, 50, 80, 100]"
                    :page-size="pageSize"
                    :total="totalPages"
                    @size-change="onPageSizeChange"
                    @current-change="onPageChange"
                ></el-pagination>
            </div>
        </el-footer>
        <el-dialog title="违约记录" :visible.sync="showList" :close-on-click-modal="false">
            <div>
                <el-table ref="listModal" border :data="modalList" v-loading="listLoading">
                    <el-table-column label="律师姓名" prop="attorneyName"></el-table-column>
                    <el-table-column label="预约时间" prop="appointmentTime"></el-table-column>
                    <el-table-column label="看守所名称" prop="detentionCenterName"></el-table-column>
                    <el-table-column label="被会见人" prop="suspectsName"></el-table-column>
                    <el-table-column label="会见类型" prop="type">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type=='ONLINE'">远程会见</span>
                            <span v-if="scope.row.type=='OFFLINE'">预约会见</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="del(scope.row)">消除记录</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="modal-bottom">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :current-page="listNum"
                        :page-size="listSize"
                        :total="modalTotal"
                        @current-change="onListPageChange"
                    ></el-pagination>
                </div>
            </div>
        </el-dialog>
        <el-dialog
            title="编辑违约次数"
            class="date-modal"
            :visible.sync="showEdit"
            width="25%"
            :close-one-click-modal="false"
        >
            <div class="text-center">
                <el-input v-model="currentLawyer.artificialViolation"></el-input>
            </div>
            <div class="footer-out">
                <el-button type="primary" @click="editSave" v-loading="save.edit">保存</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
import List from '../../view/List';
import deleteBtn from '../../view/DeleteButton';

export default {
    components: { List, deleteBtn },
    data() {
        return {
            tableLoading: false,
            listLoading: false,
            listData: [], //列表
            showEdit: false, //编辑某律师的人工次数
            showList: false, //某律师违规预约列表
            currentLawyer: '', //当前选中律师
            save: {
                edit: false,
                list: false
            },
            tableHeight: 0,
            attorneyName: '',
            pageSize: 20,
            pageNum: 1,
            totalPages: 1, //大列表

            listNum: 1, //弹窗列表
            listSize: 10, //弹窗列表
            modalTotal: 1,
            modalList: []
        };
    },
    created() {
        this.getData();
    },
    mounted() {
        this.calcTableHeight();
        window.addEventListener('resize', () => {
            this.calcTableHeight();
        });
    },
    methods: {
        /**
         *@description:获取高度
         * */
        calcTableHeight() {
            let height = this.$refs.tableFooter ? this.$refs.tableFooter.$el.clientHeight : 0;
            if (this.$refs.tableHeader) {
                height = height + this.getOffsetLeft(this.$refs.tableHeader.$el) + this.$refs.tableHeader.$el.clientHeight + 30;
            }
            this.tableHeight = document.body.clientHeight - height;
        },
        getOffsetLeft(elem) {
            var offsetLeft = 0;
            do {
                if (!isNaN(elem.offsetTop)) {
                    offsetLeft += elem.offsetTop;
                }
            } while ((elem = elem.offsetParent));
            return offsetLeft;
        },
        /**
         * @description:更新列表内容
         */
        getData(e) {
           
            let query = {
                attorneyName: this.attorneyName,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };
            this.tableLoading = true;
            this.ax
                .get('violation/attorneyViolationListResponse', {
                    params: query
                })
                .then(res => {
                    this.tableLoading = false;
                    this.listData = res.contents;
                    this.totalPages = res.page.total;
                })
                .catch(err => {
                    this.tableLoading = false;
                });
        },
        /**
         * @description:分页
         */
        onPageChange(e) {
            this.pageNum = e;
            this.getData();
        },
        /**
         * @description:改变每页数量
         */
        onPageSizeChange(e) {
            this.pageSize = e;
            this.getData();
        },
        /**
         * @description:显示编辑预约弹窗
         */
        edit(e) {
            this.showEdit = true;
            this.currentLawyer = JSON.parse(JSON.stringify(e));
        },
        /**
         * @description:保持编辑次数
         */
        editSave() {
            let reg = /^[0-9]*$/;
            if (!reg.test(this.currentLawyer.artificialViolation) || !this.currentLawyer.artificialViolation) {
                this.$message.error('请输入正确的次数');
                return;
            }
            this.save.edit = true;
            let query = {
                artificialViolation: this.currentLawyer.artificialViolation,
                attorneyId: this.currentLawyer.attorneyId,
                presenceStatus: 1
            };
            this.ax
                .post('violation/updateViolation', query)
                .then(res => {
                    this.$message.success('保持成功');
                    this.save.edit = false;
                    this.showEdit = false;

                    this.getData();
                })
                .catch(err => {
                    this.save.edit = false;
                });
        },
        /**
         * @description:显示违规预约记录弹窗
         */
        list(e) {
            this.showList = true;
            this.currentLawyer = e;
            this.getList();
        },
        /**
         * @description:获取该律师违约记录
         */
        getList() {
            let query = {
                attorneyId: this.currentLawyer.attorneyId,
                pageNum: this.listNum,
                pageSize: this.listSize
            };
            this.listLoading = true;
            this.ax
                .get('violation/accessViolation', {
                    params: query
                })
                .then(res => {
                    this.listLoading = false;
                    this.modalList = res.contents;
                    this.modalTotal = res.page.total;
                })
                .catch(err => {
                    this.listLoading = false;
                });
        },
        /**
         * @description:弹窗列表分页
         */
        onListPageChange(e) {
            this.listNum = e;
            this.getList();
        },
        /**
         * @description:消除违约记录
         */
        del(item) {
            this.$confirm('', '确认已违约吗', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                let accessId = item.id;
                this.ax.post('violation/accessViolation?accessId=' + accessId).then(res => {
                    this.$message.success('消除成功');
                    this.getList();
                    this.getData();
                });
            });
        }
    }
};
</script>

<style lang="less" scoped>
/deep/.el-dialog {
    min-width: 400px;
}
.footer-out {
    margin-top: 1rem;
    text-align: right;
}
.el-header {
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
    overflow: hidden;
    height: auto;
    padding: 10px 10px 0px 10px;
    min-height: 60px;
}
.el-main {
    padding: 0;
}
.el-footer {
    padding: 0 10px;
}
.modal-bottom {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
}
</style>