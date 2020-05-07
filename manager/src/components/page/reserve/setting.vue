<template>
    <div class="setting">
        <el-row>
            <el-tabs v-model="activeName">
                <el-tab-pane label="时间段设置" name="first">
                    <div>
                        <el-form ref="period">
                            <el-form-item label="时间段:">
                                <el-tag
                                    class="m-r-10"
                                    size="big"
                                    v-for="(item, index) in period"
                                    :key="index"
                                    closable
                                    @close="handleClosePeriod(index)"
                                >{{ item.period }}</el-tag>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="addTime = true">添加时间段</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="会见须知" name="second">
                    <div style="border:1px solid #eee;border-radius:3px;">
                        <quillEditor ref="myTextEditor" v-model="meet.note" :options="editorOption"></quillEditor>
                    </div>
                    <div class="caption-num">{{ meet.note.length }}</div>
                    <div class="text-right">
                        <el-button type="primary" @click="saveMeet" v-loading="save.loadingTwo">保存</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="时间段预约人数设置" name="third">
                    <div class="m-b-10 period-num">
                        <el-tabs>
                            <el-tab-pane
                                :label="wk.name"
                                v-for="(wk, wkindex) in week"
                                :key="wkindex"
                            >
                                <div
                                    class="flex-row m-b-20"
                                    v-for="(item, index) in periodNum"
                                    :key="index"
                                >
                                    <div class="m-r-10">
                                        <el-tag size="big">{{ item.name }}</el-tag>
                                    </div>
                                    <div class="m-r-10">
                                        <el-input
                                            :disabled="!item.edit"
                                            v-model="item.list[wkindex].peopleNumber"
                                        ></el-input>
                                    </div>
                                    <div>
                                        <el-button
                                            type="primary"
                                            v-loading="save.loadingThree"
                                            @click="savePeriodNum(wkindex, index)"
                                            v-if="item.edit"
                                        >保存</el-button>
                                        <el-button
                                            type="primary"
                                            @click="editPeriodNum(index)"
                                            v-if="!item.edit"
                                        >编辑</el-button>
                                    </div>
                                </div>

                                <div class="place" v-if="!periodNum || !periodNum.length">请先添加时间段</div>
                            </el-tab-pane>
                        </el-tabs>

                        <!-- <el-table :data="periodNum">
                                <el-table-column label="时间段" align="center">
                                    <template slot-scope="scope">
                                        <el-tag>{{scope.row.name}}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="周日" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[6]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="周一" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[0]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="周二" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[1]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="周三" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[2]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="周四" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[3]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="周五" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[4]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column label="周六" align="center">
                                    <template slot-scope="scope">
                                        <el-input
                                            type="text"
                                            v-model="scope.row.list[5]"
                                            @keyup="value=value.replace(/\d/g,'')"
                                        />
                                    </template>
                                </el-table-column>
                        </el-table>-->
                    </div>
                    <!-- <div class="text-right">
                            <el-button type="primary" @click="savePeriodNum">保存</el-button>
                            <el-button>取消</el-button>
                    </div>-->
                </el-tab-pane>
                <el-tab-pane label="温馨提示" name="four">
                    <div class="m-b-10">
                        <el-input
                            :autosize="{ minRows: 8 }"
                            resize="none"
                            placeholder="请输入温馨提示"
                            type="textarea"
                            v-model="caption.note"
                        ></el-input>
                    </div>
                    <div class="text-right">
                        <el-button
                            type="primary"
                            @click="saveCaption"
                            v-loading="save.loadingFour"
                        >保存</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="违约设置" name="five">
                    <div class="place m-b-40">封禁时间每年清空，重新统计。</div>
                    <div
                        class="flex-row m-b-20 period-num"
                        v-for="(item, index) in violation"
                        :key="index"
                    >
                        <div class="m-r-10">
                            <el-tag size="big">{{ item.name + '次' }}</el-tag>
                        </div>
                        <div class="m-r-10 flex-row flex-center">
                            <el-input class="m-r-10" :disabled="!item.edit" v-model="item.num"></el-input>
                            <span class="place">天</span>
                        </div>
                        <div>
                            <el-button
                                type="primary"
                                @click="saveViolation(index)"
                                v-if="item.edit"
                            >保存</el-button>
                            <el-button
                                type="primary"
                                @click="editViolation(index)"
                                v-if="!item.edit"
                            >编辑</el-button>
                            <el-button
                                type="danger"
                                @click="deleteViolation(index)"
                                v-if="index == violation.length - 1"
                            >删除</el-button>
                        </div>
                    </div>
                    <div class="text-right">
                        <el-button
                            type="primary"
                            @click="AddViolationSetting"
                            v-loading="save.loadingFive"
                        >添加</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="远程预约席位设置" name="six">
                    <div class="flex-row align-center yuanchen">
                        <div class="place">远程预约席位数量：</div>
                        <el-input
                            class="m-r-20"
                            v-model.number="reserveNumber.peopleNumber"
                            :disabled="!reserveNumberStatus"
                            placeholder="请输入远程预约席位数量"
                        ></el-input>
                        <el-button
                            type="primary"
                            v-if="reserveNumberStatus"
                            v-loading="save.loadingSix"
                            @click="saveNumber"
                        >保存</el-button>
                        <el-button
                            type="primary"
                            v-if="!reserveNumberStatus"
                            @click="reserveNumberStatus=!reserveNumberStatus"
                        >编辑</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="预约访问规则设置" name="seven">
                    <div class="place m-b-20">访问规则：</div>
                    <div class="flex-row m-b-20 flex-between align-center">
                        <div>
                            <div class="m-b-20">
                                <el-radio
                                    :disabled="!reserveRuleStatus"
                                    :label="1"
                                    v-model="reserveRule.serialNumber"
                                >一个律师一天预约会见一次</el-radio>
                            </div>
                            <div>
                                <el-radio
                                    :disabled="!reserveRuleStatus"
                                    :label="2"
                                    v-model="reserveRule.serialNumber"
                                >一个律师一天预约会见上午一次，下午一次</el-radio>
                            </div>
                        </div>
                    </div>
                    <el-button
                        type="primary"
                        @click="saveReserveRule"
                        v-loading="save.loadingSeven"
                    >{{!reserveRuleStatus?'编辑':'保存'}}</el-button>
                </el-tab-pane>
                <el-tab-pane label="预约会见温馨提示" name="eight">
                    <div class="m-b-10">
                        <el-input
                            :autosize="{ minRows: 8 }"
                            resize="none"
                            placeholder="预约会见温馨提示"
                            type="textarea"
                            v-model="reserveCaption.note"
                        ></el-input>
                    </div>
                    <div class="text-right">
                        <el-button
                            type="primary"
                            @click="saveReserveCaption('eight')"
                            v-loading="save.loadingEight"
                        >保存</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="注册首页提示" name="nine">
                    <div class="m-b-10">
                        <el-input
                            :autosize="{ minRows: 8 }"
                            resize="none"
                            placeholder="注册首页提示"
                            type="textarea"
                            v-model="registerCaption.note"
                        ></el-input>
                    </div>
                    <div class="text-right">
                        <el-button
                            type="primary"
                            @click="saveReserveCaption('nine')"
                            v-loading="save.loadingNine"
                        >保存</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="注册详情页提示" name="ten">
                    <div class="m-b-10">
                        <el-input
                            :autosize="{ minRows: 8 }"
                            resize="none"
                            placeholder="注册详情页提示"
                            type="textarea"
                            v-model="registerDetailCaption.note"
                        ></el-input>
                    </div>
                    <div class="text-right">
                        <el-button
                            type="primary"
                            @click="saveReserveCaption('ten')"
                            v-loading="save.loadingTen"
                        >保存</el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-row>

        <!--添加时间段-->
        <el-dialog title="添加时间段" :visible.sync="addTime" width="30%">
            <div>
                <el-time-select
                    v-model="TimeValue"
                    :picker-options="timeOptions"
                    placeholder="选择时间"
                ></el-time-select>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addTime = false">取 消</el-button>
                <el-button type="primary" @click="addPeriod" v-loading="save.loadingOne">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { quillEditor } from 'vue-quill-editor';
export default {
    components: {
        quillEditor
    },
    data() {
        return {
            editorOption: {
                placeholder: '请输入会见须知',
                theme: 'bubble'
            },
            type: 1, //1-时间段设置，2-文字提示设置，3-时间段预约人数设置
            period: [], //时间段列表
            textPrompt: {}, //文字提示
            periodNum: [], //时间段预约人数
            violation: [], //违约设置
            activeName: 'first', //选中页
            save: {
                loadingOne: false,
                loadingTwo: false,
                loadingThree: false,
                loadingFour: false,
                loadingFive: false,
                loadingSix: false,
                loadingSeven: false,
                loadingEight: false,
                loadingNine: false,
                loadingTen: false
            },
            week: [
                {
                    name: '周日'
                },
                {
                    name: '周一'
                },
                {
                    name: '周二'
                },
                {
                    name: '周三'
                },
                {
                    name: '周四'
                },
                {
                    name: '周五'
                },
                {
                    name: '周六'
                }
            ],
            addTime: false, //添加时间段
            TimeValue: '', //添加的时间段的值。
            timeNum: 5, //时间段数量限制
            timeOptions: {
                start: '08:30',
                step: '00:15',
                end: '18:30'
            }, //添加时间段配置。

            meet: {
                note: ''
            }, //会见须知
            caption: {
                note: ''
            }, //温馨提示
            reserveCaption: {
                note: ''
            }, //预约会见温馨提示
            registerCaption: {
                note: ''
            }, //注册首页提示
            registerDetailCaption: {
                note: ''
            }, //注册详情提示
            reserveNumber: {
                peopleNumber: ''
            }, //远程预约席位
            reserveNumberStatus: false,

            reserveRule: {
                serialNumber: ''
            },
            reserveRuleStatus: false
        };
    },
    created() {
        this.getSetting();
    },
    watch: {
        activeName(val) {
            ['first', 'second', 'third', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].forEach((it, ix) => {
                if (it == val) {
                    if (ix < 5) {
                        this.type = ix + 1;
                    } else {
                        this.type = ix + 2;
                    }
                }
            });
            this.getSetting();
        }
    },
    methods: {
        /**
         * @description:获取预约设置
         */
        getSetting() {
            let query = {
                type: this.type
            };
            this.ax
                .get('accessManagenment/appointmentSettings', {
                    params: query
                })
                .then(res => {
                    if (this.type == 1) {
                        this.period = res;
                    }
                    if (this.type == 2) {
                        this.meet = res && res.length ? res[0] : { note: '' };
                    }
                    if (this.type == 3) {
                        this.setPeriodNum(this.period, res);
                    }
                    if (this.type == 4) {
                        this.caption = res && res.length ? res[0] : { note: '' };
                    }
                    if (this.type == 5) {
                        res.sort();
                        this.violation = res.map(it => {
                            let item = {
                                name: it.serialNumber,
                                num: it.peopleNumber,
                                edit: false,
                                id: it.id
                            };
                            return item;
                        });
                    }
                    if (this.type == 7) {
                        this.reserveNumber = res && res.length ? res[0] : { peopleNumber: '' };
                    }
                    if (this.type == 8) {
                        this.reserveRule = res && res.length ? res[0] : { serialNumber: '' };
                    }
                    if (this.type == 9) {
                        this.reserveCaption = res && res.length ? res[0] : { note: '' };
                    }
                    if (this.type == 10) {
                        this.registerCaption = res && res.length ? res[0] : { note: '' };
                    }
                    if (this.type == 11) {
                        this.registerDetailCaption = res && res.length ? res[0] : { note: '' };
                    }
                });
        },
        /**
         * @description:保存时间段
         */
        saveTime() {
            let list = [
                {
                    name: 'A',
                    start: '123',
                    end: '1234'
                },
                {
                    name: 'B',
                    start: '324',
                    end: '2323'
                }
            ];
            this.ax.get('test', {
                params: {
                    start: '1245',
                    end: '123',
                    list: JSON.stringify(list)
                }
            });
        },
        /**
         * @description:会见须知
         */
        saveMeet() {
            if (!this.meet.note) {
                this.$message.error('请输入会见须知');
                return;
            }
            let query = {
                note: this.meet.note,
                type: 2
            };
            if (this.meet.id) {
                query.id = this.meet.id;
            }
            this.save.loadingTwo = true;
            this.saveSetting(query);
        },
        /**
         * @description:保存时间段预约人数设置
         * @index:下标
         * @ix:周日到周六，0-6
         */
        savePeriodNum(ix, index) {
            let list = this.periodNum;
            let num = list[index].list[ix];
            let reg = /^[0-9]*$/g;

            if (!num.peopleNumber) {
                num.peopleNumber = 0;
            }
            if (!reg.test(num.peopleNumber)) {
                this.$message.error('请输入数字');
                num.peopleNumber = 0;
                return;
            }
            let item = {
                serialNumber: ix,
                period: list[index].name,
                type: 3,
                peopleNumber: num.peopleNumber,
                presenceStatus: 1
            };
            if (num.id) {
                item.id = num.id;
            }
            this.save.loadingThree = true;
            this.ax
                .post('accessManagenment/appointmentSettings', item)
                .then(res => {
                    this.save.loadingThree = false;
                    this.$message.success('保存成功');
                    this.editPeriodNum(index);
                    this.getSetting();
                })
                .catch(err => {
                    this.save.loadingThree = false;
                });
        },
        /**
         * @description:编辑预约人数设置
         */
        editPeriodNum(index) {
            let periodNum = JSON.parse(JSON.stringify(this.periodNum));
            periodNum[index].edit = !periodNum[index].edit;
            this.periodNum = periodNum;
        },
        /**
         * @description:保存，8，9，10
         */
        saveReserveCaption(index) {
            let list = {
                eight: {
                    type: 9,
                    caption: this.reserveCaption,
                    text: '预约会见温馨提',
                    loading: 'loadingEight'
                },
                nine: {
                    type: 10,
                    caption: this.registerCaption,
                    text: '注册首页提示',
                    loading: 'loadingNine'
                },
                ten: {
                    type: 11,
                    caption: this.registerDetailCaption,
                    text: '注册详情提示',
                    loading: 'loadingTen'
                }
            };
            if (!list[index].caption.note) {
                this.$message.error('请输入' + list[index].text);
                return;
            }
            let query = {
                note: list[index].caption.note,
                type: list[index].type
            };
            if (list[index].caption.id) {
                query.id = list[index].caption.id;
            }
            this.save[list[index].loading] = true;
            this.saveSetting(query);
        },
        /**
         * @description:保存温馨提示
         */
        saveCaption() {
            if (!this.caption.note) {
                this.$message.error('请输入温馨提示');
                return;
            }
            // if (this.caption.note > 50) {
            //     this.$message.error('最多输入50个字');
            //     return;
            // }
            let query = {
                note: this.caption.note,
                type: 4
            };
            if (this.caption.id) {
                query.id = this.caption.id;
            }
            this.save.loadingFour = true;
            this.saveSetting(query);
        },
        /**
         * @description:保存设置
         */
        saveSetting(query, cb) {
            // let query = {
            //     note: '', //文字简介
            //     peopleNumber: '', //预约人数设置
            //     period: '', //时间段设置
            //     presenceStatus: '', //0-删除，1-新建
            //     serialNumber: '', //1-时间段排序 3-日期周
            //     type: '' //1-时间段，2-会见须知，3-时间段人数，4-温馨提示。
            // };
            let save = this.save;
            this.ax
                .post('accessManagenment/appointmentSettings', query)
                .then(res => {
                    this.$message.success('保存成功');
                    for (let key in save) {
                        save[key] = false;
                    }
                    this.save = save;
                    this.getSetting();

                    cb && cb();
                })
                .catch(err => {
                    let save = this.save;
                    for (let key in save) {
                        save[key] = false;
                    }
                    this.save = save;
                });
        },
        /**
         * @description:添加时间段
         */
        addPeriod() {
            if (!this.TimeValue) {
                this.$message.error('请选择时间!');
                return;
            }

            let list = JSON.parse(JSON.stringify(this.period));
            if (list.length >= 5) {
                this.$message.error('时间段最多添加5个');
                return;
            }
            let item = list.filter(it => {
                return it.period == this.TimeValue;
            });
            if (item && item.length) {
                this.$message.error('已有相同时间段!');
                return;
            } else {
                let query = {
                    type: 1,
                    period: this.TimeValue
                };
                this.save.loadingOne = true;
                this.ax
                    .post('accessManagenment/appointmentSettings', query)
                    .then(res => {
                        this.save.loadingOne = false;
                        this.$message.success('添加成功');
                        this.getSetting();
                        this.addTime = false;
                        this.TimeValue = '';
                    })
                    .catch(err => {
                        this.save.loadingOne = false;
                    });
            }
        },
        /**
         * @description:删除时间段
         */
        handleClosePeriod(val) {
            let query = {
                ids: this.period[val].id
            };

            this.$confirm('', '确认删除？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                this.ax.delete('accessManagenment/appointmentSettings', { params: query }).then(res => {
                    this.$message.success('删除成功');
                    this.getSetting();
                });
            });
        },
        /**
         * @description:时间段排序
         */
        sortPeriod(one, two) {},
        /**
         * @description:设置时间段预约人数
         */
        setPeriodNum(arr, numArr) {
            if (!arr || !arr.length) {
                this.periodNum = [];
                return;
            }
            let list = [];
            arr.forEach(it => {
                let item = {
                    name: it.period,
                    list: new Array(7).fill({ peopleNumber: 0 }),
                    edit: false
                };
                list.push(item);
            });
            if (numArr && numArr.length) {
                this.setValue(list, numArr);
            } else {
                this.periodNum = list;
            }
        },
        /**
         * @description:获取人数值，赋值
         */
        setValue(arr, numArr) {
            let list = JSON.parse(JSON.stringify(arr));
            list.forEach(it => {
                let numList = numArr.filter(el => {
                    return el.period == it.name;
                });
                if (numList && numList.length) {
                    numList.forEach(num => {
                        it.list[num.serialNumber].peopleNumber = num.peopleNumber;
                        it.list[num.serialNumber].id = num.id;
                    });
                }
            });
            this.periodNum = list;
        },

        /**
         * @description:添加爽约设置
         */
        AddViolationSetting() {
            let list = JSON.parse(JSON.stringify(this.violation));
            let item = {
                name: list.length + 1,
                num: 0,
                edit: false
            };
            list.push(item);
            this.violation = list;
        },
        /**
         * @description:编辑爽约设置
         */
        editViolation(index) {
            let list = JSON.parse(JSON.stringify(this.violation));
            list[index].edit = !list[index].edit;
            this.violation = list;
        },
        /**
         * @description:保存爽约设置
         */
        saveViolation(index) {
            let list = JSON.parse(JSON.stringify(this.violation));
            let item = list[index];
            let reg = /^[0-9]*$/g;
            if (!reg.test(item.num)) {
                this.$message.error('请输入数字');
                return;
            }
            let query = {
                type: 5,
                peopleNumber: item.num,
                serialNumber: item.name,
                presenceStatus: 1
            };
            if (item.id) {
                query.id = item.id;
            }
            this.saveSetting(query, () => {
                this.editViolation(index);
            });
        },
        /**
         * @description:删除爽约设置
         */
        deleteViolation(index) {
            let list = JSON.parse(JSON.stringify(this.violation));
            let item = list[index];
            if (item.id) {
                this.$confirm('', '确认删除？', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    let query = {
                        ids: item.id
                    };
                    this.ax
                        .delete('accessManagenment/appointmentSettings', {
                            params: query
                        })
                        .then(res => {
                            this.$message.success('删除成功');
                            this.getSetting();
                        });
                });
            } else {
                list.splice(index, 1);
                this.violation = list;
            }
        },
        /**
         * @description:保存预约席位设置
         */
        saveNumber() {
            let item = JSON.parse(JSON.stringify(this.reserveNumber));
            let reg = /^[0-9]*$/g;

            if (!item.peopleNumber && item.peopleNumber !== 0) {
                this.$message.error('不能为空');
                return;
            }
            if (!reg.test(item.peopleNumber)) {
                this.$message.error('请输入数字');
                return;
            }
            this.save.loadingSix = true;
            let query = {
                type: 7,
                peopleNumber: item.peopleNumber,
                presenceStatus: 1
            };
            if (item.id) {
                query.id = item.id;
            }
            this.saveSetting(query, () => {
                this.reserveNumberStatus = false;
            });
        },
        /**
         * @description:保存预约规则设置
         */
        saveReserveRule() {
            if (!this.reserveRuleStatus) {
                this.reserveRuleStatus = true;
            } else {
                let item = JSON.parse(JSON.stringify(this.reserveRule));
                if (!item.serialNumber) {
                    this.$message.error('请选择规则');
                    return;
                }
                this.save.loadingSeven = true;
                let query = {
                    type: 8,
                    serialNumber: item.serialNumber,
                    presenceStatus: 1
                };
                if (item.id) {
                    query.id = item.id;
                }
                this.saveSetting(query, () => {
                    this.reserveRuleStatus = false;
                });
            }
        }
    }
};
</script>

<style lang="less" scoped>
.setting {
    background-color: white;
    padding: 10px;
    box-sizing: border-box;
    /deep/.period-num {
        .el-input__inner {
            text-align: center;
        }
    }
}
.place {
    font-size: 14px;
    color: #999;
}
.caption-num {
    font-size: 14px;
    color: #bbb;
    margin: 0.5rem 0;
    text-align: right;
}
.yuanchen {
    align-items: center;
    /deep/ .el-input {
        width: auto;
    }
}
.m-r-20 {
    margin-right: 20px;
}
</style>
