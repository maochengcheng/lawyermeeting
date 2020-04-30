<template>
    <div>
        <List
            :dataUrl="'violation/violationLog'"
            :metaUrl="'violation/meta'"
            ref="list"
            :data="listData"
            @meta="onMeta"
            @getSelect="getSelect"
            :disableTableAction="true"
            :tableMeta="tableMeta"
        >
            <template slot="addition-actions">
                <el-button type="primary" @click="outExcel">导出Excel</el-button>
            </template>
        </List>
    </div>
</template>

<script>
import List from '../../view/List';
import deleteBtn from '../../view/DeleteButton';

export default {
    components: { List, deleteBtn },
    data() {
        return {
            listData: [],
            tableMeta: [],
            select: {}
        };
    },
    methods: {
        /**
         * @description:更新meta
         */
        onMeta(e) {},
        /**
         * @description:更新meta
         */
        getSelect(item) {
            this.select = {
                managerName: item.managerName,
                attorneyName: item.attorneyName,
                start: item.times ? this.cn.changeDate(Number(item.times.split(',')[1]), true) : '',
                end: item.times ? this.cn.changeDate(Number(item.times.split(',')[2]), true) : ''
            };
        },
        /**
         * @description:导出Excel
         */
        outExcel() {
            this.ax.get('violation/violationLogExcel', { params: this.select }).then(res => {
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
        }
    }
};
</script>
<style>
</style>