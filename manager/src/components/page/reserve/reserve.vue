<template>
    <div v-loading="allLoading">
        <List
            :dataUrl="'accessManagenment/access'"
            :metaUrl="'accessManagenment/meta'"
            ref="list"
            :data="listData"
            @data="changeData"
            @delete="deleteReserve"
            @create="showAdd"
            @meta="onMeta"
            :tableMeta="tableMeta"
            :hideStatus="true"
            @selected="getSelected"
        >
            <template slot="addition-table-actions" slot-scope="scope">
                <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.item.row.certification=='通过' && scope.item.row.accessStatus=='未到访'"
                    @click="edit(scope.item.row)"
                >编辑</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.item.row.certification=='待审核'"
                    @click="audit(scope.item.row,'auth')"
                >审核</el-button>
                <el-button type="primary" size="mini" @click="audit(scope.item.row,'detail')">详情</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.item.row.certification=='通过' && scope.item.row.accessStatus=='未到访'"
                    @click="showInputNote(scope.item.row)"
                >违约</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.item.row.certification=='通过' && scope.item.row.accessStatus=='未到访'"
                    @click="confirmMeet(scope.item.row)"
                >确认会见</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    v-if="scope.item.row.certification=='通过' && scope.item.row.accessStatus=='已到访'"
                    @click="closeMeet(scope.item.row)"
                >结束会见</el-button>
            </template>
            <template slot="addition-actions">
                <el-button type="primary" @click="showExcel">导出Excel</el-button>
            </template>
            <template slot="addbatch-btn-actions">
                <el-button
                    type="primary"
                    @click="doBatch('PASS','NOTVISITED','VIOLATION')"
                    v-loading="batchLoading"
                >违约</el-button>
                <el-button
                    type="primary"
                    @click="doBatch('PASS','NOTVISITED','VISITED')"
                    v-loading="batchLoading"
                >确定会见</el-button>
                <el-button
                    type="primary"
                    @click="doBatch('PASS','VISITED','END')"
                    v-loading="batchLoading"
                >结束会见</el-button>
            </template>
        </List>

        <el-dialog
            :title="showDetail?'查看详情':'预约审核'"
            :visible.sync="authShow"
            :close-on-click-modal="false"
        >
            <div class="m-b-40">
                <div class="flex-row flex-between m-b-20">
                    <div class="w-30 flex-row">
                        <div>律师姓名：</div>
                        <div>{{ current.attorneyName }}</div>
                    </div>
                    <div class="w-30 flex-row">
                        <div>被会见人姓名：</div>
                        <div>{{ current.suspectsName }}</div>
                    </div>
                    <div class="w-40 flex-row">
                        <div>会见类型：</div>
                        <div>
                            <div>{{ (current.type == 'OFFLINE' || current.type=='预约会见')? '预约会见' : '远程会见' }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex-row flex-between m-b-20">
                    <div class="w-30 flex-row">
                        <div>会见时间：</div>
                        <div>{{ current.appointmentTime }}</div>
                    </div>
                    <div class="w-30 flex-row">
                        <div>是否初次会见：</div>
                        <div>{{ current.isFirst}}</div>
                    </div>
                    <div class="w-40 flex-row">
                        <div>会见{{current.type=='远程会见'?'派出所':'看守所'}}：</div>
                        <div>{{ current.detentionCenterName }}</div>
                    </div>
                </div>
                <template
                    v-if="current.type=='远程会见' && current.qualifications3 && current.qualifications3.length"
                >
                    <div class="m-b-20">律师证</div>
                    <div class="m-b-20">
                        <div class="text-center img-list">
                            <div class v-for="(item,index) in current.qualifications3" :key="index">
                                <el-image
                                    fit="contain"
                                    style="width:100%;height:300px;"
                                    :src="item.path"
                                    lazy
                                    :preview-src-list="current.qualifications3.map(it=>{
                                    return it.path})"
                                ></el-image>
                            </div>
                        </div>
                    </div>
                    <div class="m-b-20">押犯罪嫌疑人、被告人专用介绍信</div>
                    <div class="m-b-20">
                        <div class="text-center img-list">
                            <div class v-for="(item,index) in current.qualifications1" :key="index">
                                <el-image
                                    fit="contain"
                                    style="width:100%;height:300px;"
                                    :src="item.path"
                                    lazy
                                    :preview-src-list="current.qualifications1.map(it=>{
                                    return it.path})"
                                ></el-image>
                            </div>
                        </div>
                    </div>
                    <div class="m-b-20">当事人委托书</div>
                    <div class="m-b-20">
                        <div class="text-center img-list">
                            <div class v-for="(item,index) in current.qualifications2" :key="index">
                                <el-image
                                    fit="contain"
                                    style="width:100%;height:300px;"
                                    :src="item.path"
                                    lazy
                                    :preview-src-list="current.qualifications2.map(it=>{
                                    return it.path})"
                                ></el-image>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <div class="text-right" v-if="!showDetail">
                <el-button type="primary" @click="auth(true)" :loading="loading">通过</el-button>
                <el-button type="primary" @click="rejectAuth(false)" :loading="loading">拒绝</el-button>
            </div>
        </el-dialog>

        <el-dialog
            title="选择日期"
            class="date-modal"
            :visible.sync="excelShow"
            width="25%"
            :close-one-click-modal="false"
        >
            <div class="text-center">
                <el-date-picker
                    v-model="outTime"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                ></el-date-picker>
            </div>
            <div class="footer-out">
                <el-button type="primary" @click="outExcel" v-loading="excelLoading">导出</el-button>
            </div>
        </el-dialog>

        <el-dialog
            :title="lay.id?'编辑记录':'添加记录'"
            class="date-modal"
            :visible.sync="addShow"
            width="25%"
            :close-one-click-modal="false"
        >
            <el-form :model="lay" :rules="rules" ref="lay">
                <div class="time-list flex-between">
                    <el-form-item label="预约人姓名" prop="attorneyName">
                        <el-select
                            v-model="lay.attorneyName"
                            filterable
                            :disabled="lay.id?true:false"
                        >
                            <template v-for="(item,index) in lawyerList">
                                <el-option :key="index" :label="item.name" :value="index">
                                    <span style="float: left">{{ item.name }}</span>
                                    <span
                                        style="float: right; color: #8492a6; font-size: 13px"
                                    >{{ item.phone }}</span>
                                </el-option>
                            </template>
                        </el-select>
                        <!-- <el-input v-model.trim="lay.attorneyName" placeholder="请输入被会见人姓名"></el-input> -->
                    </el-form-item>
                    <el-form-item label="被会见人姓名" prop="suspectsName">
                        <el-input
                            v-model.trim="lay.suspectsName"
                            :disabled="lay.id?true:false"
                            placeholder="请输入被会见人姓名"
                        ></el-input>
                    </el-form-item>
                </div>
                <div class="time-list flex-between">
                    <el-form-item label="预约时间" prop="appointmentTime">
                        <el-date-picker
                            v-model="lay.appointmentTime"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:ss:mm"
                            placeholder="选择日期时间"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="车牌号" prop="numberplate">
                        <el-input
                            v-model.trim="lay.numberplate"
                            :disabled="lay.id&&currentAdd.numberplate?true:false"
                            placeholder="请输入车牌号"
                        ></el-input>
                    </el-form-item>
                </div>
                <div class="time-list flex-between">
                    <el-form-item label="会见类型" prop="type">
                        <el-select v-model="lay.type" :disabled="lay.id?true:false">
                            <template
                                v-for="(item,index) in [{name:'远程会见',value:'ONLINE'},{name:'预约会见',value:'OFFLINE'}]"
                            >
                                <el-option :key="index" :label="item.name" :value="item.value"></el-option>
                            </template>
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        label="派出所名称"
                        v-if="lay.type=='远程会见' || lay.type=='ONLINE'"
                        prop="detentionCenterId"
                    >
                        <el-select
                            :disabled="lay.id?true:false"
                            v-model="lay.detentionCenterId"
                            filterable
                            placeholder="请选择派出所"
                        >
                            <el-option
                                v-for="item in dententionList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        label="看守所名称"
                        v-if="lay.type=='预约会见' || lay.type=='OFFLINE'"
                        prop="detentionCenterId"
                    >
                        <el-input v-model.trim="lay.detentionCenterName" :disabled="true"></el-input>
                    </el-form-item>
                </div>
                <div class="time-list flex-between" v-if="lay.type=='预约会见' || lay.type=='OFFLINE'">
                    <el-form-item label="是否初次会见" prop="isFirst">
                        <el-select v-model="lay.isFirst" :disabled="lay.id?true:false">
                            <template
                                v-for="(item,index) in [{name:'是',value:true},{name:'否',value:false}]"
                            >
                                <el-option :key="index" :label="item.name" :value="item.value"></el-option>
                            </template>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否订餐" prop="layQuantity">
                        <el-select v-model="lay.layQuantity" :disabled="lay.id?true:false">
                            <template
                                v-for="(item,index) in [{name:'是',value:true},{name:'否',value:false}]"
                            >
                                <el-option :key="index" :label="item.name" :value="item.value"></el-option>
                            </template>
                        </el-select>
                    </el-form-item>
                </div>
                <div
                    class="time-list flex-between"
                    v-if="(lay.type=='预约会见' || lay.type=='OFFLINE') && lay.layQuantity"
                >
                    <el-form-item label="请输入订餐数量" prop="orderQuantity">
                        <el-input v-model.trim="lay.orderQuantity" placeholder="请输入订餐数量"></el-input>
                    </el-form-item>
                </div>
                <div class="other-type" v-if="lay.type=='远程会见' || lay.type=='ONLINE'">
                    <el-form-item label="律师证" prop="qualifications3">
                        <!-- <template v-for="(item,index) in lay.qualifications3">
                            <div :key="index" class="upload-img">
                                <el-image
                                    fit="contain"
                                    style="width:100%;height:100%;"
                                    :src="item.path"
                                    lazy
                                    :preview-src-list="lay.qualifications3.map(it=>{
                                    return it.path})"
                                ></el-image>
                                <div class="close-icon" @click.stop="delUploadImg(3,index)">
                                    <img src="@/assets/img/close.png" alt />
                                </div>
                            </div>
                        </template>
                        <el-upload
                            class="avatar-uploader"
                            :disabled="lay.id?true:false"
                            action="/other/upload"
                            v-if="!lay.qualifications3 || lay.qualifications3.length<2"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccessThree"
                            :on-error="handleAvatarError"
                            :before-upload="beforeAvatarUploadThree"
                        >
                            <i class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>-->
                        <el-upload
                            class="avatar-uploader"
                            v-loading="imgLoading.three"
                            :disabled="lay.id?true:false"
                            action="/other/upload"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccessThree"
                            :on-error="handleAvatarError"
                            :before-upload="beforeAvatarUploadThree"
                        >
                            <el-image
                                fit="contain"
                                style="width:100%;height:100%;"
                                :src="lay.qualifications3[0].path"
                                v-if="lay.qualifications3&&lay.qualifications3.length"
                                lazy
                            ></el-image>
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="会见人介绍信" prop="qualifications1">
                        <el-upload
                            class="avatar-uploader"
                            v-loading="imgLoading.one"
                            :disabled="lay.id?true:false"
                            action="/other/upload"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccessOne"
                            :on-error="handleAvatarError"
                            :before-upload="beforeAvatarUploadOne"
                        >
                            <el-image
                                fit="contain"
                                style="width:100%;height:100%;"
                                :src="lay.qualifications1[0].path"
                                v-if="lay.qualifications1&&lay.qualifications1.length"
                                lazy
                            ></el-image>
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="当事人委托书" prop="qualifications2">
                        <el-upload
                            v-loading="imgLoading.two"
                            class="avatar-uploader"
                            :disabled="lay.id?true:false"
                            action="/other/upload"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccessTwo"
                            :on-error="handleAvatarError"
                            :before-upload="beforeAvatarUploadTwo"
                        >
                            <el-image
                                fit="contain"
                                style="width:100%;height:100%;"
                                :src="lay.qualifications2[0].path"
                                lazy
                                v-if="lay.qualifications2&&lay.qualifications2.length"
                            ></el-image>
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                </div>
            </el-form>

            <div class="footer-out">
                <el-button
                    type="primary"
                    @click="submitForm('lay')"
                    v-loading="addLoading"
                >{{lay.id?'保存':'添加'}}</el-button>
            </div>
        </el-dialog>

        <el-dialog title="未会见原因" class="note-modal" :visible.sync="noteShow" width="15%">
            <el-select placeholder="请选择原因" v-model="selectReason" @change="getReason">
                <el-option
                    v-for="(item,index) in reason"
                    :label="item.name"
                    :value="item.key"
                    :key="index"
                ></el-option>
            </el-select>
            <el-input
                class="mt-10"
                placeholder="请输入原因(20字内)"
                maxlength="20"
                v-if="selectReason=='other'"
                v-model="violationNote"
            ></el-input>
            <div class="confirm-btn">
                <el-button type="primary" v-loading="noteLoading" @click="confirmNote">确定</el-button>
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
        var vaNumberplat = (rule, value, callback) => {
            let reg = new RegExp(
                /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领 A-Z]{1}[A-HJ-NP-Z]{1}(([0-9]{5}[DF])|(DF[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领 A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9 挂学警港澳]{1})$/
            );

            if (value === '') {
                callback();
            } else if (value && reg.test(value)) {
                callback();
            } else {
                callback('请输入正确的车牌号');
            }
        };
        var vaName = (rule, value, callback) => {
            let reg = new RegExp(/^[\u4e00-\u9fa5]{2,20}$/);
            if (reg.test(value)) {
                callback();
            } else {
                callback(new Error('请输入正确的姓名'));
            }
        };
        var vaCation = (rule, value, callback) => {
            if (this.lay.type == 'ONLINE') {
                if (value && value.length) {
                    callback();
                } else {
                    callback(new Error(''));
                }
            } else {
                callback();
            }
        };
        var vaTime = (rule, value, callback) => {
            let date = new Date().getTime();
            let vDate = new Date(value).getTime();
            if (vDate < date) {
                callback('错误');
            } else {
                callback();
            }
        };
        var vaQuantity = (rule, value, callback) => {
            let reg = /^[1-9]\d*$/;
            if (!reg.test(value)) {
                callback(new Error('请输入正确的订餐数量'));
            } else {
                callback();
            }
        };
        return {
            reason: [
                {
                    name: '爽约',
                    key: 'one'
                },
                {
                    name: '手续不齐全',
                    key: 'two'
                },
                {
                    name: '人证不一致',
                    key: 'three'
                },
                {
                    name: '同行人员非律师',
                    key: 'four'
                },
                {
                    name: '其他',
                    key: 'other'
                }
            ],
            selectReason: '',
            noteShow: false, //打开原因弹窗
            noteLoading: false,
            batchLoading: false,
            loading: false,
            excelLoading: false,
            authShow: false, //弹窗显示
            excelShow: false, //导出excel
            current: '', //当前选中记录
            tableMeta: null,
            listData: [], //列表
            outTime: '',
            selectList: [], //列表选中内容
            addShow: false, //显示编辑、添加弹窗
            currentAdd: '', //选中记录
            timelist: [], //时间段列表
            lay: {
                appointmentTime: '',
                detentionCenterName: '',
                detentionCenterId: '',
                suspectsName: '',
                numberplate: '',
                isFirst: '',
                type: '',
                orderQuantity: 0,
                layQuantity: '',
                note: '',
                attorneyName: '',
                qualifications1: [],
                qualifications2: [],
                qualifications3: [],
                accessStatus: 'NOTVISITED',
                certification: 'PASS'
            },
            rules: {
                appointmentTime: [
                    { required: true, message: '请选择预约时间', trigger: 'blur' },
                    { validator: vaTime, message: '预约时间需大于当前时间', trigger: 'blur' }
                ],
                suspectsName: [
                    { required: true, message: '请输入被会见人姓名', trigger: 'blur' },
                    { validator: vaName, message: '请输入正确的姓名', trigger: 'blur' }
                ],
                detentionCenterId: [{ required: true, message: '请选择派出所', trigger: 'blur' }],
                attorneyName: [{ required: true, message: '请输入预约人姓名', trigger: 'blur' }],
                numberplate: [
                    { required: false, message: '请输入被会见人姓名', trigger: 'blur' },
                    { validator: vaNumberplat, message: '请输入正确的车牌号', trigger: 'blur' }
                ],
                isFirst: [{ required: true, message: '请选择是否初次会见', trigger: 'change' }],
                layQuantity: [{ required: true, message: '请选择是否订餐', trigger: 'change' }],
                type: [{ required: true, message: '请选择会见类型', trigger: 'change' }],
                orderQuantity: [
                    { required: true, message: '请输入订餐数量', trigger: 'blur' },
                    { validator: vaQuantity, message: '请输入正确的订餐数量', trigger: 'blur' }
                ],
                qualifications1: [{ validator: vaCation, message: '请上传介绍信', trigger: 'blur' }],
                qualifications2: [{ validator: vaCation, message: '请上传委托书', trigger: 'blur' }],
                qualifications3: [{ validator: vaCation, message: '请上传律师证', trigger: 'blur' }]
            },
            imgLoading: {
                one: false,
                two: false,
                three: false
            },
            addLoading: false,
            lawyerList: [], //律师列表
            dententionList: [], //看守所列表
            violationNote: '',
            violationItem: '', //违约选中的记录
            confirmNote: '',

            station: '',
            showDetail: false, //是否时查看详情

            allLoading: false //整个页面
        };
    },
    created() {
        this.getLaywerList();
        this.getDententionList();
        this.getManagerStation();
    },
    watch: {
        createDialog(val) {
            if (val) {
                return;
            }
            this.role = {};
        },
        noteShow(val) {
            if (!val) {
                this.selectReason = '';
            }
        },
        addShow(val) {
            if (!val) {
                this.$refs.lay.clearValidate();
            }
        },
        'lay.type'(val) {
            if (val == 'OFFLINE') {
                this.lay.detentionCenterName = '海淀看守所';
                this.lay.detentionCenterId = 1;
            }
        },
        authShow(val) {
            if (!val) {
                this.showDetail = false;
            }
        }
    },
    methods: {
        /**
         * @description:获取选择的原因
         */
        getReason(e) {
            console.log(e);
            this.reason.forEach(it => {
                if (e == it.key) {
                    if (it.key != 'other') {
                        this.violationNote = it.name;
                    } else {
                        this.violationNote = '';
                    }
                }
            });
        },
        /**
         * @description:获取设置的管理的派出所
         */
        getManagerStation() {
            let that = this;
            this.allLoading = true;
            if (!that.tableMeta) {
                setTimeout(() => {
                    this.getManagerStation();
                }, 500);
                return;
            }
            setTimeout(() => {
                this.allLoading = false;
            }, 1000);
            this.ax.get('accessManagenment/managerDetentionCenter').then(res => {
                if (res && res.detentionCenterName) {
                    that.tableMeta.subs.forEach(it => {
                        if (it.name == '看守所名称') {
                            it.disabled = true;
                            it.value = res.detentionCenterName;
                        }
                    });
                    that.station = res;
                    that.tableMeta = Object.assign({}, that.tableMeta);
                }
            });
        },
        /**
         * @description:打开填写原因弹窗
         */
        showInputNote(item) {
            this.noteShow = true;
            this.violationItem = item;
            this.confirmNote = () => {
                return this.violationMeet(this.violationItem);
            };
        },
        /**
         * @description：审核不通过
         */
        rejectAuth(status) {
            this.noteShow = true;
            this.confirmNote = () => {
                return this.auth(status);
            };
        },
        /**
         * @descriptioin:获取看守所列表
         */
        getDententionList() {
            // let query = {
            //     page:1,
            //     size:9999
            // }
            this.ax.get('accessManagenment/detentionCenter').then(res => {
                this.dententionList = res ? res.content : [];
            });
        },

        /**
         * @description:获取律师列表
         */
        getLaywerList() {
            let query = {
                page: 0,
                size: 9999
            };
            this.ax
                .get('attorneyManagement/attorney', {
                    params: query
                })
                .then(res => {
                    this.lawyerList = res.content;
                });
        },
        /**
         * @description:保存
         */
        submitForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    if (this.addLoading) {
                        return;
                    }
                    this.addLoading = true;
                    let query = JSON.parse(JSON.stringify(this.lay));
                    if (!query.id) {
                        query.attorneyId = this.lawyerList[query.attorneyName].id;
                        query.attorneyName = this.lawyerList[query.attorneyName].name;
                    } else {
                        query.accessStatus = this.changeStatus(query.accessStatus);
                        query.certification = this.change(query.certification);
                    }
                    if (query.detentionCenterId) {
                        this.dententionList.forEach(it => {
                            if (it.id == query.detentionCenterId) {
                                query.detentionCenterName = it.name;
                            }
                        });
                    }
                    if (query.type == '远程会见') {
                        query.type = 'ONLINE';
                    }
                    if (query.type == '预约会见') {
                        query.type = 'OFFLINE';
                    }
                    if (query.type == 'ONLINE') {
                        query.isFirst = false;
                    }
                    delete query.layQuantity;
                    // query.attorneyId = this.lawyerList[query.attorneyName].id;
                    this.ax
                        .post('accessManagenment/access', query)
                        .then(res => {
                            this.addShow = false;
                            this.addLoading = false;
                            if (query.id) {
                                this.$message.success('');
                            } else {
                                this.$message.success('添加成功');
                            }
                            this.$refs.list.doSearch();
                        })
                        .catch(err => {
                            this.addLoading = false;
                        });
                } else {
                    return false;
                }
            });
        },
        /**删除上传图片  */
        delUploadImg(name, index) {
            let lay = JSON.parse(JSON.stringify(this.lay));
            lay['qualifications' + name].splice(index, 1);
            this.lay = lay;
        },
        /**
         * @description:上传失败
         */
        handleAvatarError(file) {
            this.$message.error('上传失败');
            this.imgLoading = {
                one: false,
                two: false,
                three: false
            };
        },
        /**
         * @description：上传介绍信
         */
        handleAvatarSuccessOne(file, fileList) {
            let lay = JSON.parse(JSON.stringify(this.lay));

            let item = {
                path: file.data,
                type: 2
            };
            lay.qualifications1 = [];
            lay.qualifications1.push(item);
            this.lay = lay;
            this.imgLoading.one = false;
        },
        /**
         * @description：上传委托书
         */
        handleAvatarSuccessTwo(file, fileList) {
            let lay = JSON.parse(JSON.stringify(this.lay));
            let item = {
                path: file.data,
                type: 3
            };
            lay.qualifications2 = [];
            lay.qualifications2.push(item);
            this.lay = lay;
            this.imgLoading.two = false;
        },
        /**
         * @description：上传律师证
         */
        handleAvatarSuccessThree(file, fileList) {
            let lay = JSON.parse(JSON.stringify(this.lay));
            let item = {
                path: file.data,
                type: 4
            };
            // if (!lay.qualifications3 || !lay.qualifications3.length) {
            lay.qualifications3 = [];
            // }
            lay.qualifications3.push(item);
            this.lay = lay;
            this.imgLoading.three = false;
        },
        /**
         * @description:上传之前
         */
        beforeAvatarUploadOne(file, fileList) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt1M = file.size / 1024 / 1024 <= 1;
            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
                return false;
            }
            if (!isLt1M) {
                this.$message.error('上传头像图片大小不能超过 1MB!');
                return false;
            }
            this.imgLoading.one = true;
            return isJPG && isLt1M;
        },
        beforeAvatarUploadTwo(file, fileList) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt1M = file.size / 1024 / 1024 <= 1;
            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
                return false;
            }
            if (!isLt1M) {
                this.$message.error('上传头像图片大小不能超过 1MB!');
                return false;
            }
            this.imgLoading.two = true;
            return isJPG && isLt1M;
        },
        beforeAvatarUploadThree(file, fileList) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt1M = file.size / 1024 / 1024 <= 1;
            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
                return false;
            }
            if (!isLt1M) {
                this.$message.error('上传头像图片大小不能超过 1MB!');
                return false;
            }
            this.imgLoading.three = true;
            return isJPG && isLt1M;
        },
        /**
        @description:显示弹窗
         */
        showAdd() {
            if (this.station && this.station.detentionCenterId) {
                this.$message.error('权限不足');
                return;
            }
            this.addShow = true;
            this.lay = {
                appointmentTime: '',
                detentionCenterName: '',
                detentionCenterId: '',
                suspectsName: '',
                numberplate: '',
                isFirst: '',
                orderQuantity: 0,
                layQuantity: '',
                type: '',
                attorneyName: '',
                qualifications1: [],
                qualifications2: [],
                qualifications3: [],
                accessStatus: 'NOTVISITED',
                certification: 'PASS'
            };
            this.getDententionList();
        },
        /**
        @description:编辑
         */
        edit(item) {
            if (this.station && this.station.detentionCenterId) {
                this.$message.error('权限不足');
                return;
            }
            let t = item;

            // t.type = t.type == '远程会见' ? 'ONLINE' : t.type == '预约会见' ? 'OFFLINE' : '';
            t.isFirst = t.isFirst == '是' ? true : false;
            this.lay = t;
            this.currentAdd = JSON.parse(JSON.stringify(t));
            this.addShow = true;
        },
        /**
         * @description:重新配置
         *
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
            let status = {
                UNREVIEWED: '待审核',
                REJECTED: '未通过',
                PASS: '通过',
                CANCEL: '取消'
            };
            let access = {
                NOTVISITED: '未到访',
                VISITED: '已到访',
                END: '会面结束',
                VIOLATION: '违约'
            };
            data.content.forEach(it => {
                it.certification = status[it.certification];
                it.accessStatus = access[it.accessStatus];
                it.isFirst = it.isFirst ? '是' : '否';
                it.type = it.type == 'OFFLINE' ? '预约会见' : '远程会见';
                it.appointmentTime = this.cn.changeDate(it.appointmentTime, true);
            });
            this.listData = data;
        },
        /**
         * @description:审核显示弹窗
         */
        audit(item, type) {
            if (type == 'auth') {
                if (this.station && this.station.detentionCenterId) {
                    this.$message.error('权限不足');
                    return;
                }
                this.current = item;
                this.authShow = true;
            } else if (type == 'detail') {
                this.current = item;
                this.authShow = true;
                this.showDetail = true;
            }
        },
        /**
         * @description:确定会见
         */
        confirmMeet(item) {
            this.$confirm('', '确认会见吗？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                let list = JSON.parse(JSON.stringify(this.listData));
                let query = JSON.parse(JSON.stringify(item));
                query.accessStatus = 'VISITED';
                let time = this.cn.changeDate(new Date().getTime(), true);
                query.visitTime = time;
                query.certification = this.change(query.certification);
                query.isFirst = query.isFirst == '是' ? true : false;
                query.type = query.type == '预约会见' ? 'OFFLINE' : 'ONLINE';
                this.ax.post('accessManagenment/access', query).then(res => {
                    this.$message.success('会见成功');
                    list.content.forEach(it => {
                        if (it.id == item.id) {
                            it.accessStatus = '已到访';
                            it.visitTime = time;
                        }
                    });
                    this.listData = list;
                    this.$refs.list.doSearch();
                });
            });
        },
        /**
         * @description:结束会见
         */
        closeMeet(item) {
            this.$confirm('', '确认结束会见吗？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                let list = JSON.parse(JSON.stringify(this.listData));
                let query = JSON.parse(JSON.stringify(item));
                query.accessStatus = 'END';
                query.certification = this.change(query.certification);
                query.isFirst = query.isFirst == '是' ? true : false;
                query.type = query.type == '预约会见' ? 'OFFLINE' : 'ONLINE';
                this.ax.post('accessManagenment/access', query).then(res => {
                    this.$message.success('会见成功');
                    list.content.forEach(it => {
                        if (it.id == item.id) {
                            it.accessStatus = '会面结束';
                        }
                    });
                    this.listData = list;
                    this.$refs.list.doSearch();
                });
            });
        },
        violationMeet(item) {
            // this.$confirm('', '确认已违约吗', {
            //     confirmButtonText: '确定',
            //     cancelButtonText: '取消',
            //     type: 'danger'
            // }).then(() => {
            let list = JSON.parse(JSON.stringify(this.listData));
            let query = JSON.parse(JSON.stringify(item));
            if (!this.violationNote) {
                this.$message.error('请输入原因！');
                return;
            }
            query.note = this.violationNote;
            query.accessStatus = 'VIOLATION';
            query.certification = this.change(query.certification);
            query.isFirst = query.isFirst == '是' ? true : false;
            query.type = query.type == '预约会见' ? 'OFFLINE' : 'ONLINE';
            this.noteLoading = true;
            this.ax
                .post('accessManagenment/access', query)
                .then(res => {
                    this.$message.success('修改成功');
                    list.content.forEach(it => {
                        if (it.id == item.id) {
                            it.accessStatus = '违约';
                        }
                    });
                    this.listData = list;
                    this.$refs.list.doSearch();
                    this.noteShow = false;
                    this.violationItem = '';
                    this.violationNote = '';
                    this.noteLoading = false;
                })
                .catch(err => {
                    this.noteLoading = false;
                });
            // });
        },
        /**
         * @description:切换
         */
        change(item) {
            switch (item) {
                case '待审核':
                    return 'UNREVIEWED';
                    break;
                case '未通过':
                    return 'REJECTED';
                    break;
                case '通过':
                    return 'PASS';
                    break;
                case '取消':
                    return 'CANCEL';
                    break;
            }
        },
        /**
         * @description:切换
         */
        changeStatus(item) {
            switch (item) {
                case '未到访':
                    return 'NOTVISITED';
                    break;
                case '已到访':
                    return 'VISITED';
                    break;
                case '会面结束':
                    return 'END';
                    break;
                case '违约':
                    return 'VIOLATION';
                    break;
            }
        },
        /**
         * @description:审核
         */
        auth(status) {
            let item = JSON.parse(JSON.stringify(this.current));
            let list = JSON.parse(JSON.stringify(this.listData));
            let query = item;
            if (!status) {
                if (!this.violationNote) {
                    this.$message.error('请输入原因');
                    return;
                }
                query.note = this.violationNote;
                this.noteLoading = true;
            }
            query.certification = status ? 'PASS' : 'REJECTED';
            query.isFirst = query.isFirst == '是' ? true : false;
            this.loading = true;
            query.type = query.type == '预约会见' ? 'OFFLINE' : 'ONLINE';
            query.accessStatus = this.changeStatus(query.accessStatus);
            this.ax
                .post('accessManagenment/access', query)
                .then(res => {
                    this.loading = false;
                    this.$message.success('审核成功');
                    this.authShow = false;
                    list.content.forEach(el => {
                        if (el.id == item.id) {
                            el.certification = status ? '通过' : '未通过';
                        }
                    });
                    this.listData = list;
                    this.$refs.list.doSearch();
                    if (!status) {
                        this.noteLoading = false;
                        this.noteShow = false;
                        this.violationNote = '';
                    }
                })
                .catch(err => {
                    this.loading = false;
                    if (!status) {
                        this.noteLoading = false;
                    }
                });
        },
        /**
         * @description:删除预约
         */
        deleteReserve(item) {
            this.startLoading();
            this.ax
                .delete(
                    'accessManagenment/access?ids=' +
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
         * @description:显示Excel弹窗
         */
        showExcel() {
            this.excelShow = true;
        },
        /**
         * @description:导出Excel
         */
        outExcel() {
            this.excelLoading = true;
            let query = {
                start: this.outTime[0] + ' 00:00:00',
                end: this.outTime[1] + ' 23:59:59'
            };
            if (this.station) {
                query.detentionCenterId = this.station.detentionCenterId;
            }
            this.ax
                .get('accessManagenment/exportAccessExcel', { params: query })
                .then(res => {
                    let data = res;

                    let name = data.split('/')[1];
                    var link = document.createElement('a');
                    link.download = name;
                    link.style.display = 'none';
                    link.href = this.httpUrl + data;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    this.$message.success('下载成功');
                    this.excelLoading = false;
                    this.excelShow = false;
                })
                .catch(err => {
                    this.excelLoading = false;
                });
        },
        /**
         * @descrpition:获取列表选中列表
         */
        getSelected(e) {
            this.selectList = e;
        },
        /**
         * @description:批量 违约，确定会见，结束会见
         */
        doBatch(state, status, change) {
            let changeName = change == 'VIOLATION' ? '违约' : change == 'VISITED' ? '确定会见' : '结束会见';
            this.$confirm('', `确认批量${changeName}吗？`, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                // this.doBatch(e, true);

                let list = JSON.parse(JSON.stringify(this.selectList));
                let item = list.filter(it => {
                    return status != this.changeStatus(it.accessStatus) || state != this.change(it.certification);
                });
                if (item && item.length) {
                    this.$message.error('请选择正确的可操作记录');
                    return;
                }
                let query = list.map(it => {
                    return {
                        accessId: it.id,
                        accessStatus: change
                    };
                });
                this.batchLoading = true;
                this.ax
                    .post('accessManagenment/accessBatch', query)
                    .then(res => {
                        this.batchLoading = false;
                        this.$message.success('操作成功');
                        this.$refs.list.doSearch();
                    })
                    .catch(err => {
                        this.batchLoading = false;
                    });
            });
        }
    }
};
</script>
<style lang="less" scoped>
/deep/.el-dialog {
    min-width: 700px;
    .time-list {
        .el-input__inner {
            width: 250px;
        }
        // .el-upload--text {
        //     line-height: 180px;
        // }
    }
    .el-upload {
        width: 200px;
        height: 150px;
        line-height: 150px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
    }
}
/deep/.other-type {
    .el-form-item--small .el-form-item__content {
        display: flex;
    }
    .el-form-item--small .el-form-item__label {
        text-align: left;
        width: 100%;
        float: none;
    }
    .upload-img {
        width: 200px;
        height: 150px;
        background-color: gainsboro;
        margin-right: 20px;
        position: relative;
        // overflow: hidden;
        &:hover {
            .close-icon {
                display: flex;
                opacity: 1;
                transform: translateX(0%);
            }
        }
        .close-icon {
            opacity: 0;
            transform: translateX(-100%);
            width: 15px;
            height: 15px;
            background-color: red;
            border-radius: 50%;
            position: absolute;
            transition: all 0.2s ease;
            top: -5px;
            right: -5px;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            img {
                width: 12px;
                height: 12px;
                display: block;
            }
        }
    }
}

.text-center {
    text-align: center;
}
.date-modal {
    min-width: 400px;
}
.footer-out {
    text-align: right;
    margin-top: 1rem;
}
.text-center {
    text-align: center;
}
.img-list {
    height: 300px;
    overflow: auto;
}
.mt-10 {
    margin-top: 1rem;
}
.flex-between {
    justify-content: space-between;
}
.time-list {
    display: flex;
    flex-wrap: wrap;
}
.time-item {
    width: 5rem;
    height: 2rem;
    border-radius: 0.5rem;
    border: 1px solid gainsboro;
}
/deep/.note-modal {
    .el-select {
        width: 100%;
    }
    .el-dialog {
        min-width: 400px !important;
    }
    .confirm-btn {
        margin-top: 20px;
        text-align: center;
    }
}
</style>
