import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import request from './utils/request';
import './style/zc.css';
import { Message } from 'element-ui';
import DeleteButton from './components/view/DeleteButton';
import './router/permission';
import common from './utils/common.js';

Vue.config.productionTip = false;

Vue.prototype.ax = request;
Vue.prototype.cn = common;
Vue.prototype.httpUrl = '/';

Vue.use(VueI18n);
Vue.use(DeleteButton);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});

Vue.prototype.toast = function(msg, type) {
    if (!msg) {
        return;
    }
    Message({ type: type || 'error', message: msg });
};

Vue.prototype.selfLoading = function(object, loading) {
    Vue.set(object, 'loading', loading);
};

let loadingInstance;

Vue.prototype.startLoading = function() {
    loadingInstance = app.$loading({
        lock: true,
        text: '请稍后',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.8)'
    });
};
Vue.prototype.stopLoading = function() {
    loadingInstance && loadingInstance.close();
};

Vue.prototype.addProperty = function(object, name, value) {
    Vue.set(object, name, value);
};

Vue.prototype.delay = function(cb, time) {
    setTimeout(
        () => {
            cb && cb();
        },
        time ? time * 1000 : 2000
    );
};

//使用钩子函数对路由进行权限跳转
// router.beforeEach((to, from, next) => {
//     document.title = `${to.meta.title} | ToChat 管理端`;
//     const role = localStorage.getItem('ms_username');
//     if (!role && to.path !== '/login') {
//         next('/login');
//     } else if (to.meta.permission) {
//         // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
//         role === 'admin' ? next() : next('/403');
//     } else {
//         // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
//         if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
//             Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
//                 confirmButtonText: '确定'
//             });
//         } else {
//             next();
//         }
//     }
// });

let app = new Vue({
    router,
    i18n,
    render: h => h(App)
}).$mount('#app');
