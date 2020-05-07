<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <div class="logo">律所会见管理端</div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>
                <!-- 消息中心 -->
                <!-- 用户头像 -->
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="changePass">修改登录密码</el-dropdown-item>
                        <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <el-dialog title="修改登录密码" :visible.sync="changePassDialog" :close-on-click-modal="false">
            <el-form>
                <el-form-item label="新密码">
                    <el-input placeholder="新密码" v-model="newPass.pass1" type="password"></el-input>
                </el-form-item>
                <el-form-item label="重复新密码">
                    <el-input placeholder="重复新密码" v-model="newPass.pass2" type="password"></el-input>
                </el-form-item>
                <div class="m-b-10 red">为了账号安全，修改成功后将退出登录</div>
                <el-button
                    type="primary"
                    @click="changePassword"
                    :loading="newPass.loading"
                    :disabled="newPass.disabled"
                >保存</el-button>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
import bus from '../common/bus';
export default {
    data() {
        return {
            changePassDialog: false,
            collapse: false,
            fullscreen: false,
            name: '未登录',
            message: 2,
            newPass: {}
        };
    },
    computed: {
        username() {
            let username = '未登录';
            try {
                username = JSON.parse(localStorage.getItem('user')).info.name;
            } catch (e) {}
            return username ? username : this.name;
        }
    },
    methods: {
        changePassword() {
            let newpass = this.newPass;
            if (!this.newPass.pass1) {
                this.toast('请输入密码');
                return;
            }
            if (!this.newPass.pass2) {
                this.toast('请确认密码');
                return;
            }
            if (!(this.newPass.pass1 == this.newPass.pass2)) {
                this.toast('两次密码不一致');
                return;
            }
            this.selfLoading(this.newPass, true);
            this.ax
                .post('manager/pass', { password: this.newPass.pass1 })
                .then(it => {
                    this.toast('修改成功,即将跳转', 'success');
                    this.selfLoading(this.newPass, false);
                    this.addProperty(this.newPass, 'disabled', true);
                    this.delay(() => {
                        this.changePassDialog = false;
                        this.doLogout();
                    }, 3);
                })
                .catch(it => {
                    this.selfLoading(this.newPass, false);
                });
        },
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command == 'loginout') {
                this.doLogout();
            }
            if (command == 'changePass') {
                this.changePassDialog = true;
            }
        },
        doLogout() {
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            this.$router.push('/login');
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse;
            bus.$emit('collapse', this.collapse);
        },
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        }
    },
    mounted() {
        if (document.body.clientWidth < 1500) {
            this.collapseChage();
        }
    }
};
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;
    color: #fff;
}
.collapse-btn {
    float: left;
    padding: 0 21px;
    cursor: pointer;
    line-height: 70px;
}
.header .logo {
    float: left;
    width: 250px;
    line-height: 70px;
}
.header-right {
    float: right;
    padding-right: 50px;
}
.header-user-con {
    display: flex;
    height: 70px;
    align-items: center;
}
.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
}
.btn-bell-badge {
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}
.btn-bell .el-icon-bell {
    color: #fff;
}
.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 20px;
}
.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: #fff;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
</style>
