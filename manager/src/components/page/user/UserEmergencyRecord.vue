<template>
    <div>
        <List 
        :metaUrl="'user/emergency/meta'" 
        :dataUrl="'user/emergence/record'"
        :tableData="tableData" 
        @create="createDialog=true" 
        :tableMeta="tableMeta" 
        @meta="onMeta"
        :disableAction="true">
        <template slot-scope="scope" slot="addition-table-actions">
            <el-button type="primary" size="mini" @click="openMap(scope.item.row)">查看位置</el-button>
        </template>
        </List>

        <el-dialog title="编辑紧急空间用户">
            <el-form>
                <el-form-item label="用户名">
                    <el-input placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item label="用户头像">
                    
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog :visible.sync="showMap" title="查看位置">
            <baidu-map ak="MTbA1cyzTlx8L3apKKPN37wL" class="baidu" :center="center" @ready="handler" :zoom="13">
                <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
                   <bm-marker :position="center" :dragging="true" >
            </bm-marker>
            </baidu-map>
        </el-dialog>
    </div>
</template>

<script>
import List from "../../view/List"
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import BmNavigation from 'vue-baidu-map/components/controls/Navigation'
import BmMarker from 'vue-baidu-map/components/overlays/Marker'

export default {
    components:{List,BaiduMap,BmNavigation,BmMarker},
    data(){
        return {
            showMap:false,
            filter:{bb:"bb"},
            createDialog:false,
            tableData:{},
            tableMeta:{},
            center:{lng:0,lat:0},
            item: null
        }
    },
    methods:{
        onMeta(meta){
            meta.edit = "EDIT_NONE"
            this.tableMeta = meta;
        },
        openMap(e){
          
            this.item = e
            this.showMap = true

        },
        handler(){
          
            this.center = {lng:this.item.longitude,lat:this.item.latitude}    
        }
    }
}
</script>
<style scoped>

.baidu{
    height: 30rem;
    width: 100%;
}
</style>