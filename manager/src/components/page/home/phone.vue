<template>
    <div class="phone">
        <!-- <el-row>
            <el-col>
                <el-table ref="list" :data="phone" v-loading="tableLoading">
                    <el-table-column align="center" label="联系方式" prop="note"> </el-table-column>
                    <el-table-column align="center" label="创建时间" prop="time"></el-table-column>
                    <el-table-column align="center" label="操作">
                        <template slot-scope="scope">
                            <el-button type="danger" @click="deletephone(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <el-row type="flex" justify="space-between">
                    <div></div>
                    <div>
                        <el-button type="primary" @click="phoneStatus = !phoneStatus">添加</el-button>
                    </div>
                </el-row>
            </el-col>
        </el-row>-->
        <List
            ref="list"
            :data="listData"
            :tableMeta="tableMeta"
            @edit="editItem"
            @delete="deletephone"
        >
            <template slot="addition-actions">
                <el-button type="primary" @click="addItem">添加</el-button>
                <el-button type="primary" @click="startSort">排序</el-button>
            </template>
        </List>
        <el-dialog title="添加联系方式" :visible.sync="phoneStatus" :close-on-click-modal="false">
            <div class="el-row">
                <el-input v-model="currentItem.note" placeholder="请输入联系方式"></el-input>
            </div>
            <div class="text-right">
                <el-button type="primary" @click="addPhone" v-loading="loading">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="添加联系方式" :visible.sync="showSort" :close-on-click-modal="false">
            <el-table :data="sortPhone">
                <el-table-column label="联系方式" prop="note"></el-table-column>
                <el-table-column label="创建时间" prop="time"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="prev(scope.$index)">上移</el-button>
                        <el-button type="primary" @click="next(scope.$index)">下移</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="height:1rem;"></div>
            <div class="text-right">
                <el-button type="primary" @click="saveSort" v-loading="sortLoading">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import List from '../../view/List';

export default {
    name: 'dashboard',
    components: { List },

    data() {
        return {
            phoneStatus: false, //保存或编辑phone
            user: '', //用户信息
            phone: [],
            sortPhone:[],
            sortLoading:false,
            showSort: false,
            currentItem: {
                note: ''
            },
            loading: false,
            tableLoading: false
        };
    },

    created() {
        this.getPhone();
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
                content: this.phone,
                size: 20,
                totalElements: this.phone.length
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
                edit: 'EDIT',
                print: 'NONE',
                export: 'NONE',
                insertable: false,
                deleteKey: 'id',
                subs: [
                    {
                        key: 'note',
                        name: '联系方式',
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
                        type: 'TEXT',
                        sort: 0,
                        sortable: false,
                        clickable: false
                    },

                    {
                        key: 'createTime',
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
        phoneStatus(val) {
            if (!val) {
                this.age = 0;
            }
        }
    },
    methods: {
        /**
         * @description:保存排序后的数组
         */
        saveSort(){
            this.sortLoading = true;
            let list = JSON.parse(JSON.stringify(this.sortPhone))
            list.forEach((it,ix)=>{
                it.serialNumber = ix+1 
            })
            this.ax.post("accessManagenment/contactDetailsSort",list).then(
                (res)=>{
                    this.sortLoading = false;
                    this.$message.success("保存成功");
                    this.showSort = false;
                    this.getPhone();
                }
            ).catch(err=>{
                this.sortLoading = false
            })
        },
        /**
         * @description:下移
         */
        next(e) {
            if (e == this.phone.length - 1) {
                this.$message.error('该条记录不能下移');
                return;
            }
            let list = JSON.parse(JSON.stringify(this.sortPhone))
            let temp = list[e];
            list[e] = list[e+1];
            list[e+1] = temp;
            this.sortPhone = list;
        },
        /**
         * @description:上移
         */
        prev(e) {
            if (!e) {
                this.$message.error('该条记录不能上移');
                return;
            }
            let list = JSON.parse(JSON.stringify(this.sortPhone))
            let temp = list[e];
            list[e] = list[e-1];
            list[e-1] = temp;
            this.sortPhone = list;
        },
        /**
         * @description:开始排序
         */
        startSort() {
            this.showSort = !this.showSort;
        },
        /**
         * @description:获取联系人方式
         */
        getPhone() {
            this.tableLoading = true;
            this.ax
                .get('home/appointmentSettings')
                .then(res => {
                    this.tableLoading = false;
                    let data = res;
                    data.forEach(it => {
                        it.time = this.cn.changeDate(it.createTime, true);
                    });
                    this.phone = data;
                    this.sortPhone=data;
                })
                .catch(err => {
                    this.tableLoading = false;
                });
        },
        /**
         * @description:添加联系方式
         */
        addPhone() {
            let query = {
                note: this.currentItem.note,
                serialNumber: this.currentItem.serialNumber ? this.currentItem.serialNumber : this.phone.length + 1,
                type: 6
            };
            if (this.currentItem.id) {
                query.id = this.currentItem.id;
            }else if(this.phone.length==10){
                this.$message.error("最多添加10条记录");
                return;
            }
            this.loading = true;
            this.ax.post('home/appointmentSettings', query).then(res => {
                this.$message.success(this.currentItem.id ? '修改成功' : '添加成功');
                this.phoneStatus = !this.phoneStatus;
                this.loading = false;
                this.getPhone();
            }).catch(err=>{
                this.loading = false;
            });
        },
        /**
         * @description:删除联系方式
         */
        deletephone(list) {
            let item = list[0];

            let query = {
                ids: item.id,
                presenceStatus: 0
            };
            this.ax
                .delete('home/appointmentSettings', {
                    params: query
                })
                .then(res => {
                    this.$message.success('删除成功');
                    this.getPhone();
                });
        },
        addItem(e) {
            this.phoneStatus = true;
            this.currentItem = {
                note: ''
            };
        },
        /**
         * @description:编辑联系方式
         */
        editItem(e) {
            this.currentItem = JSON.parse(JSON.stringify(e[0]));
            this.phoneStatus = true;
        }
    }
};
</script>

<style scoped>
.el-row {
    margin-bottom: 20px;
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
.add-phone {
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
