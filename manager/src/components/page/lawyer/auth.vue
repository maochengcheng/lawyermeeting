<template>
    <el-container class="bg-white">
        <el-header height="auto" ref="tableHeader">
            <el-row class="bg-white">
                <el-col :span="20" class="table-action flex-row flex-wrap">
                    <el-input placeholder="请输入律师名" v-model="name" clearable></el-input>
                    <el-date-picker
                        v-model="searchTime"
                        value-format="timestamp"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="创建开始时间"
                        end-placeholder="创建结束日期"
                    ></el-date-picker>
                    <el-select v-model="searchStatus" clearable placeholder="请选择预约状态">
                        <!-- <el-option :label="'全部'+item.name" :value="null">全部{{item.name}}</el-option> -->
                        <el-option
                            v-for="option in options"
                            :key="option.key"
                            :value="option.key"
                            :label="option.name"
                        ></el-option>
                    </el-select>
                    <el-button type="primary" @click="getList()">筛选</el-button>
                </el-col>
                <el-col :span="4" class="flex-row end table-action"></el-col>
            </el-row>
        </el-header>
        <el-main :style="'height:'+tableHeight+'px;overflow:scroll'">
            <div class="bg-white" style="height:100%">
                <el-table ref="list" border :data="list" v-loading="tableLoading">
                    <el-table-column label="微信头像">
                        <template slot-scope="scope">
                            <el-image
                                :src="scope.row.wechatAvatar"
                                :preview-src-list="[scope.row.wechatAvatar]"
                                style="width:4rem;height:4rem;"
                            ></el-image>
                        </template>
                    </el-table-column>
                    <el-table-column label="姓名" prop="name"></el-table-column>
                    <el-table-column label="性别" prop="gender">
                        <template slot-scope="scope">
                            <div>{{scope.row.gender=='MALE'?'男':"女"}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="手机号" prop="phone"></el-table-column>
                    <el-table-column label="身份证号" prop="idNumber"></el-table-column>
                    <el-table-column label="律师证件号" prop="licenseNumber"></el-table-column>
                    <el-table-column label="创建时间" prop="createTime"></el-table-column>

                    <el-table-column label="审核状态">
                        <template slot-scope="scope">
                            <el-tag type="success" v-if="scope.row.certification=='PASS'">通过</el-tag>
                            <el-tag v-if="scope.row.certification=='UNREVIEWED'">待审核</el-tag>
                            <el-tag type="danger" v-if="scope.row.certification=='REJECTED'">未通过</el-tag>
                            <el-tag type="info" v-if="scope.row.certification=='CANCEL'">取消</el-tag>
                        </template>
                    </el-table-column>

                    <!-- <el-table-column label="认证材料">
                        <template slot-scope="scope">
                            <el-image
                                v-for="(item,index) in scope.row.qualifications"
                                :src="item.path"
                                :key="index"
                                :preview-src-list="scope.row.qualifications"
                                style="width:4rem;height:4rem;"
                            ></el-image>
                        </template>
                    </el-table-column>-->
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button
                                type="primary"
                                v-if="scope.row.certification=='UNREVIEWED'"
                                @click="showAuth(scope.row)"
                            >审核</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-main>
        <el-footer ref="tableFooter" class="flex-row between flex-center">
            <div></div>
            <div class="pagination" v-if="list">
                <el-pagination
                    background
                    layout="sizes,total, prev, pager, next"
                    :current-page="pageNum"
                    :page-sizes="[20, 50, 80, 100]"
                    :page-size="pageSize"
                    :total="totalPage"
                    @size-change="onPageSizeChange"
                    @current-change="onPageChange"
                ></el-pagination>
            </div>
        </el-footer>
        <el-dialog title="审核律师" :visible.sync="authDialog" :close-on-click-modal="false">
            <div class="m-b-40">
                <div class="flex-row flex-between m-b-20">
                    <div class="w-30 flex-row">
                        <div>姓名：</div>
                        <div>{{current.name}}</div>
                    </div>
                    <div class="w-30 flex-row">
                        <div>性别：</div>
                        <div>{{current.gender=='MALE'?'男':'女'}}</div>
                    </div>
                    <div class="w-40 flex-row">
                        <div>身份证号：</div>
                        <div>{{current.idNumber}}</div>
                    </div>
                </div>
                <div class="flex-row flex-between m-b-20">
                    <div class="w-30 flex-row">
                        <div>手机号：</div>
                        <div>{{current.phone}}</div>
                    </div>
                    <div class="w-30 flex-row">
                        <div>律师证号：</div>
                        <div>{{current.licenseNumber}}</div>
                    </div>
                    <div class="w-40 flex-row">
                        <div>律师事务所：</div>
                        <div>{{current.lawOffice}}</div>
                    </div>
                </div>
                <div class="m-b-20">审核资料</div>
                <div class="m-b-20">
                    <div class="text-center img-list">
                        <div class v-for="(item,index) in current.qualifications" :key="index">
                            <el-image
                                fit="contain"
                                style="width:100%;height:300px;"
                                :src="item.path"
                                lazy
                                :preview-src-list="current.qualifications.map(it=>{
                                    return it.path})"
                            ></el-image>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-right">
                <el-button type="primary" @click="auth(true)" :loading="loading">通过</el-button>
                <el-button type="primary" @click="auth(false)" :loading="loading">拒绝</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
import List from '../../view/List';
// import permission from './permission';
export default {
    components: { List },
    data() {
        return {
            tableLoading: false,
            authDialog: false, //
            loading: false, //
            name: '', //律师名
            pageNum: 1,
            pageSize: 20,
            list: [], //列表
            totalPage: 1, //总页数
            tableHeight: 0,
            current: '',
            searchTime: '', //筛选创建时间
            searchStatus: '', //筛选状态
            options: [
                {
                    name: '通过',
                    key: 'PASS'
                },
                {
                    name: '未通过',
                    key: 'REJECTED'
                },
                {
                    name: '取消',
                    key: 'CANCEL'
                },
                {
                    name: '待审核',
                    key: 'UNREVIEWED'
                }
            ]
        };
    },
    watch: {
        createDialog(val) {
            if (val) {
                return;
            }
        }
    },
    created() {
        this.getList();
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
         * @description:获取列表
         *
         */
        getList() {
            this.tableLoading = true;
            let query = {
                name: this.name,
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                start: this.searchTime && this.searchTime.length ? this.searchTime[0] : '',
                end: this.searchTime && this.searchTime.length ? this.searchTime[1] : '',
                certification: this.searchStatus
            };
            this.ax
                .get('attorneyManagement/qualification', {
                    params: query
                })
                .then(res => {
                    this.tableLoading = false;

                    this.list = res.contents;
                    this.totalPage = res.page.total;
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
            this.getList();
        },
        /**
         * @description:改变每页数量
         */
        onPageSizeChange(e) {
            this.pageSize = e;
            this.getList();
        },
        /**
         * @description:显示审核框
         */
        showAuth(item) {
            this.current = item;
            this.authDialog = true;
        },
        /**
         * @description:审核
         */
        auth(status) {
            let query = {
                attorneyId: this.current.attorneyId,
                certification: status ? 'PASS' : 'REJECTED' //预约审核状态 未通过 已通过,可用值:REJECTED,PASS
            };
            this.loading = true;
            this.ax
                .post('attorneyManagement/qualification', query)
                .then(res => {
                    this.loading = false;
                    this.$message.success('审核成功');
                    this.authDialog = false;
                    this.getList();
                })
                .catch(err => {
                    this.loading = false;
                });
        }
    }
};
</script>
<style lang="less" scoped>
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
/deep/.el-dialog {
    min-width: 700px;
}
.text-center {
    text-align: center;
}
.img-list {
    height: 300px;
    overflow: auto;
}
</style>