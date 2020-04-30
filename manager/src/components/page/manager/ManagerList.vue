<template>
    <div>
        <List
            :dataUrl="'manager'"
            :metaUrl="'manager/meta'"
            :tableData="tableData"
            @delete="deleteManager"
            @create="openCreate"
            @edit="editManager"
            ref="list"
            :tableMeta="tableMeta"
        >
            <template slot="addition-table-actions" slot-scope="scope">
                <el-button type="primary" @click="openPermission(scope.item.row)">查看权限</el-button>
            </template>
        </List>

        <el-dialog title="编辑管理员" :visible.sync="createDialog">
            <el-form>
                <el-form-item label="用户名">
                    <el-input placeholder="用户名" v-model="manager.name"></el-input>
                </el-form-item>
                <el-form-item label="登录账号">
                    <el-input placeholder="登录账号" v-model="manager.mobile" type="mobile"></el-input>
                </el-form-item>
                <el-form-item label="登录密码">
                    <el-input placeholder="登录密码" v-model="manager.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="管理派出所">
                    <div class>
                        <el-select v-model="selectType" class="mr" placeholder="请选择">
                            <el-option
                                v-for="(item,index) in [{name:'全部',key:'all'},{name:'特定',key:'one'}]"
                                :key="index"
                                :label="item.name"
                                :value="item.key"
                            ></el-option>
                        </el-select>
                        <el-select
                            v-model="selectStation"
                            @change="setStation"
                            v-if="selectType=='one'"
                        >
                            <el-option
                                v-for="(item,index) in list"
                                :key="index"
                                :label="item.name"
                                :value="index"
                            ></el-option>
                        </el-select>
                    </div>
                </el-form-item>
                <el-form-item label="用户角色" v-if="createDialog">
                    <div class="el-input">
                        <el-checkbox
                            :label="role.name"
                            v-for="role in roles"
                            :key="role.id"
                            :checked="role.check"
                            @change="onRoleChange($event, role)"
                        ></el-checkbox>
                    </div>
                </el-form-item>
                <el-button type="primary" @click="saveManager" :loading="manager.loading">保存</el-button>
            </el-form>
        </el-dialog>
        <el-dialog :visible.sync="showPermission" title="查看权限">
            <permission :manager="currentManager.id"></permission>
        </el-dialog>
    </div>
</template>

<script>
import List from '../../view/List';
import Vue from 'vue';
import Permission from '../auth/permission';
export default {
    components: { List, Permission },
    data() {
        return {
            filter: { bb: 'bb' },
            createDialog: false,
            tableData: {},
            tableMeta: {},
            roles: [],
            manager: {},
            showPermission: false,
            currentManager: {},
            station: {
                detentionCenterId: '',
                detentionCenterName: ''
            },
            selectType: '',
            selectStation: '', //选择的派出所
            list: [] //派出所列表
        };
    },
    watch: {
        createDialog(val) {
            if (val) {
                this.$forceUpdate();
                return;
            }
            if (!val) {
                this.selectType = '';
                this.selectStation = '';
            }
            this.manager = {};
            this.roles = this.roles.map(it => {
                Vue.set(it, 'check', false);
                return it;
            });
        },
        selectType(val) {
            if (val == 'one') {
                this.getSelectManager();
            } else if (val == 'all') {
                this.station = {};
            }
        }
    },
    created() {
        this.getAllRole();
    },
    methods: {
        /**
         * @description:设置选中的派出所
         */
        setStation() {
            this.station = {
                detentionCenterId: this.list[this.selectStation].id,
                detentionCenterName: this.list[this.selectStation].name
            };
        },
        /**
         * @description:创建时获取到派出所列表
         */
        openCreate() {
            this.createDialog = true;
            this.getSelectManager();
        },
        /**
         * @description:获取可选择的管理员
         */
        getSelectManager(id) {
            let query = {
                page: 0,
                size: 999
            };
            this.ax
                .get('detentionCenter/detentionCenter', {
                    params: query
                })
                .then(res => {
                    this.list = res.content;
                    if (id) {
                        this.list.forEach((it, ix) => {
                            if (it.id == id) {
                                this.selectStation = ix;
                                this.setStation();
                            }
                        });
                    }
                });
        },
        /**
         * @description:添加管理员成功后设置他所管理的派出所
         */
        setManagerStation(it) {
            let query = Object.assign({}, this.station);
            query.managerId = it.id;
            this.ax.post('accessManagenment/managerDetentionCenter', query).then(res => {
                console.log(res);
            });
        },
        /**
         * @description:获取编辑的管理的管理派出所
         */
        getEditManager(item) {
            this.ax
                .get('accessManagenment/managerDetentionCenter', {
                    params: {
                        managerId: item.id
                    }
                })
                .then(res => {
                    if (res && res.detentionCenterName) {
                        this.selectType = 'one';
                        this.station = {
                            detentionCenterId: res.detentionCenterId,
                            detentionCenterName: res.detentionCenterName
                        };
                        this.getSelectManager(res.detentionCenterId);
                    } else {
                        this.selectType = 'all';
                    }
                });
        },
        openPermission(item) {
            this.currentManager = item;
            this.showPermission = true;
        },
        onRoleChange(e, role) {
            Vue.set(role, 'check', e);
            this.manager.roles = this.roles.filter(it => {
                return it.check;
            });
        },
        getAllRole() {
            this.ax.get('auth/role', { params: { size: 100000 } }).then(it => {
                this.roles = it.content;
            });
        },
        editManager(e) {
            this.manager = Object.assign({}, this.manager, e[0]);
            this.createDialog = true;
            let manager = this.manager;
            this.getEditManager(manager);
            this.roles = this.roles.map(it => {
                it.check =
                    manager.roles.filter(item => {
                        return item.id == it.id;
                    }).length > 0;
                return it;
            });
            this.$forceUpdate();
        },
        saveManager() {
            let manager = this.manager;
            if (!this.manager.name) {
                this.toast('请输入名称');
                return;
            }
            if (!this.manager.mobile) {
                this.toast('请输入登录手机号');
                return;
            }
            if (!this.manager.password && !this.manager.id) {
                this.toast('请输入登录密码');
                return;
            }
            if (!this.manager.roles || !this.manager.roles.length) {
                this.toast('请选择角色');
                return;
            }
            if (!this.selectType) {
                this.toast('请选择管理派出所');
                return;
            }
            this.selfLoading(this.manager, true);
            this.ax
                .post('manager', manager)
                .then(it => {
                    this.selfLoading(this.manager, false);
                    this.createDialog = false;

                    this.setManagerStation(it);

                    this.selectType = '';
                    if (manager.id) {
                        this.$refs.list.onUpdate([it]);
                        return;
                    }
                    this.$refs.list.onAdd(it);
                })
                .catch(it => {
                    this.selfLoading(this.manager, false);
                });
        },
        deleteManager(manager) {
            this.startLoading();
            this.ax
                .delete(
                    'manager?ids=' +
                        manager
                            .map(it => {
                                return it.id;
                            })
                            .join(',')
                )
                .then(it => {
                    this.stopLoading();
                    this.$refs.list.onDeleted(manager);
                })
                .catch(it => {
                    this.stopLoading();
                });
        }
    }
};
</script>
<style lang="less" scoped>
.flex- {
    display: flex;
    flex-direction: column;
}
.mr {
    margin-right: 10px;
}
</style>
