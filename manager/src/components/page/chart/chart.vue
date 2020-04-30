<template>
    <div class="chart">
        <el-row>
            <div class="m-b-20 flex-row flex-center">
                <el-date-picker
                    v-model="reserve_time"
                    type="daterange"
                    range-separator="至"
                    value-format="yyyy-MM-dd"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="m-r-10"
                ></el-date-picker>
                <el-button type="primary" @click="searchReserve">筛选</el-button>
            </div>
            <div v-loading="reserve_loading">
                <schart
                    ref="reserve"
                    v-if="reserve.datasets.length"
                    class="schart"
                    canvasId="reserve"
                    :options="reserve"
                ></schart>
                <div class="schart no-info" v-if="!reserve.datasets.length">暂无数据</div>
            </div>
        </el-row>
        <div class="m-b-20 flex-row flex-center">
            <el-date-picker
                v-model="meet_time"
                type="daterange"
                range-separator="至"
                value-format="yyyy-MM-dd"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="m-r-10"
            ></el-date-picker>
            <el-button type="primary" @click="searchMeet">筛选</el-button>
        </div>
        <div v-loading="meet_loading">
            <schart
                ref="meet"
                v-if="meet.datasets.length"
                class="schart"
                canvasId="meet"
                :options="meet"
            ></schart>
            <div class="schart no-info" v-if="!meet.datasets.length">暂无数据</div>
        </div>
    </div>
</template>

<script>
import Schart from 'vue-schart';

export default {
    name: 'chart',
    components: {
        Schart
    },
    data() {
        return {
            reserve: {
                type: 'line',
                title: {
                    text: '预约数量统计图'
                },
                labels: [],
                datasets: []
            }, //预约数据
            meet: {
                type: 'line',
                title: {
                    text: '会见数量统计图'
                },
                labels: [],
                datasets: []
            }, //会见数据
            reserve_time: '',
            meet_time: '',
            reserve_loading: false,
            meet_loading: false,

            meet_start: '',
            meet_end: '',
            reserve_start: '',
            reserve_end: ''
        };
    },
    created() {
        this.setDate();
    },
    methods: {
        /**
         * @description:第一次设置时间
         */
        setDate(type) {
            let date = this.cn.changeDate();
            let list = [];
            list.push(date.substring(0, 8) + '01');
            list.push(date);
            if (type == 'meet' || !type) {
                this.meet_time = list;

                this.getMeet();
            }
            if (type == 'reserve' || !type) {
                this.reserve_time = list;
                this.getReserve();
            }
        },
        /**
         * @description:检查是否大于30天
         */
        checkTime(time) {
            let start = new Date(time[0]).getTime();
            let end = new Date(time[1]).getTime();
            let key = 1000 * 60 * 60 * 24 * 30;
            if (end - start > key) {
                return false;
            } else {
                return true;
            }
        },
        /**
         *@description: 筛选会见数据根据日期
         */
        searchMeet() {
            if (!this.checkTime(this.meet_time)) {
                this.$message.error('间隔不能超过30天');
                this.setDate('meet');
                return;
            }
            this.getMeet();
        },
        /**
         *@description:  筛选预约数据根据日期
         */
        searchReserve() {
            if (!this.checkTime(this.reserve_time)) {
                this.$message.error('间隔不能超过30天');
                this.setDate('reserve');
                return;
            }
            this.getReserve();
        },
        /**
         *@description: 获取每日会见数据
         */
        getMeet() {
            let query = {
                start: this.meet_time[0] + ' 00:00:00',
                end: this.meet_time[1] + ' 23:59:59'
            };
            for (let key in query) {
                if (!query[key]) {
                    delete query[key];
                }
            }
            this.meet_loading = true;
            this.ax
                .get('statistics/accessMeetNumber', {
                    params: query
                })
                .then(res => {
                    this.meet_loading = false;

                    if (res && res.length) {
                        this.meet.labels = res.map(it => {
                            return it.date;
                        });
                        let list = [];
                        list.push({
                            label: '数量',
                            data: res.map(it => {
                                return it.number;
                            })
                        });
                        this.meet.datasets = list;
                    }
                })
                .catch(err => {
                    this.meet_loading = false;
                });
        },
        /**
         * @description:获取每日预约数据
         */
        getReserve() {
            let query = {
                start: this.reserve_time[0] + ' 00:00:00',
                end: this.reserve_time[1] + ' 23:59:59'
            };
            for (let key in query) {
                if (!query[key]) {
                    delete query[key];
                }
            }
            this.reserve_loading = true;
            this.ax
                .get('statistics/accessNumber', {
                    params: query
                })
                .then(res => {
                    this.reserve_loading = false;
                    if (res && res.length) {
                        this.reserve.labels = res.map(it => {
                            return it.date;
                        });
                        let list = [];
                        list.push({
                            label: '数量',
                            data: res.map(it => {
                                return it.number;
                            })
                        });
                        this.reserve.datasets = list;
                    }
                })
                .catch(err => {
                    this.reserve_loading = false;
                });
        }
    }
};
</script>

<style>
.chart {
    background-color: white;
    padding: 20px;
    box-sizing: border-box;
}
.schart {
    height: 340px;
}
.no-info {
    text-align: center;
    line-height: 340px;
    color: #666;
}
</style>