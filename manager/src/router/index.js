import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: '/home/home'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '自述文件' },
            name: 'home',
            children: [
                {
                    path: '/home',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '首页', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'home',
                            component: () => import('../components/page/home/home.vue'),
                            meta: { title: '看板' }
                        },
                        {
                            path: 'banner',
                            component: () => import('../components/page/home/banner.vue'),
                            meta: { title: '轮播图' }
                        },
                        {
                            path: 'phone',
                            component: () => import('../components/page/home/phone.vue'),
                            meta: { title: '联系人设置' }
                        }
                    ]
                },
                {
                    path: '/system',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '系统设置', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'manager',
                            component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/manager/ManagerList.vue'),
                            meta: { title: '设置管理员', icon: 'el-icon-lx-copy' }
                        },
                        {
                            path: 'role',
                            component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/auth/role.vue'),
                            meta: { title: '角色设置', icon: 'el-icon-lx-copy' }
                        }
                    ]
                },
                // {
                //     path: '/emergency',
                //     component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                //     meta: { title: '紧急空间', icon: 'el-icon-lx-copy' },
                //     children: [
                //         {
                //             path: 'userEmergencyList',
                //             component: () => import('../components/page/user/UserEmergencyList.vue'),
                //             meta: { title: '用户管理' }
                //         },
                //         {
                //             path: 'userEmergencyRecord',
                //             component: () => import('../components/page/user/UserEmergencyRecord.vue'),
                //             meta: { title: '进入记录' }
                //         },
                //         {
                //             path: 'chat',
                //             hide: true,
                //             name: 'emergencyChat',
                //             component: () => import('../components/page/user/EmergencyChat.vue'),
                //             meta: { title: '聊天管理' }
                //         }
                //     ]
                // },
                // {
                //     path: '/user',
                //     component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                //     meta: { title: '用户管理', icon: 'el-icon-lx-copy' },
                //     children: [
                //         {
                //             path: 'userList',
                //             component: () => import('../components/page/user/UserList.vue'),
                //             meta: { title: '用户列表' }
                //         }
                //     ]
                // },
                {
                    path: '/reserve',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '预约管理', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'list',
                            component: () => import('../components/page/reserve/reserve.vue'),
                            meta: { title: '预约记录' }
                        },
                        {
                            path: 'setting',
                            component: () => import('../components/page/reserve/setting.vue'),
                            meta: { title: '预约设置' }
                        }
                    ]
                },
                {
                    path: '/lawyer',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '律师管理', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'list',
                            component: () => import('../components/page/lawyer/list.vue'),
                            meta: { title: '律师库' }
                        },
                        {
                            path: 'auth',
                            component: () => import('../components/page/lawyer/auth.vue'),
                            meta: { title: '审核' }
                        }
                    ]
                },
                {
                    path: '/dentention',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '派出所管理', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'list',
                            component: () => import('../components/page/dentention/list.vue'),
                            meta: { title: '派出所库' }
                        }
                    ]
                },
                {
                    path: '/violation',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '违约', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'list',
                            component: () => import('../components/page/violation/list.vue'),
                            meta: { title: '违规详细列表' }
                        },
                        {
                            path: 'auth',
                            component: () => import('../components/page/violation/log.vue'),
                            meta: { title: '操作日志' }
                        }
                    ]
                },
                {
                    path: '/chart',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/common/empty.vue'),
                    meta: { title: '数据统计', icon: 'el-icon-lx-copy' },
                    children: [
                        {
                            path: 'reserve',
                            component: () => import('../components/page/chart/chart.vue'),
                            meta: { title: '预约会见统计' }
                        }
                    ]
                },
                // {
                //     path: '/dashboard',
                //     component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                //     meta: { title: '系统首页', icon: 'el-icon-lx-copy' }
                // },
                // {
                //     path: '/icon',
                //     component: () => import(/* webpackChunkName: "icon" */ '../components/page/app/update.vue'),
                //     meta: { title: '应用更新' }
                // },
                // {
                //     path: '/table/123',
                //     component: () => import(/* webpackChunkName: "table" */ '../components/page/BaseTable.vue'),
                //     meta: { title: '基础表格' }
                // },
                // {
                //     path: '/tabs',
                //     component: () => import(/* webpackChunkName: "tabs" */ '../components/page/Tabs.vue'),
                //     meta: { title: 'tab选项卡' }
                // },
                // {
                //     path: '/form',
                //     component: () => import(/* webpackChunkName: "form" */ '../components/page/BaseForm.vue'),
                //     meta: { title: '基本表单' }
                // },

                // {
                //     // markdown组件
                //     path: '/markdown',
                //     component: () => import(/* webpackChunkName: "markdown" */ '../components/page/Markdown.vue'),
                //     meta: { title: 'markdown编辑器' }
                // },
                // {
                //     // vue-schart组件
                //     path: '/charts',
                //     component: () => import(/* webpackChunkName: "chart" */ '../components/page/BaseCharts.vue'),
                //     meta: { title: 'schart图表' }
                // },
                // {
                //     // 拖拽列表组件
                //     path: '/drag',
                //     component: () => import(/* webpackChunkName: "drag" */ '../components/page/DragList.vue'),
                //     meta: { title: '拖拽列表' }
                // },
                // {
                //     // 拖拽Dialog组件
                //     path: '/dialog',
                //     component: () => import(/* webpackChunkName: "dragdialog" */ '../components/page/DragDialog.vue'),
                //     meta: { title: '拖拽弹框' }
                // },
                // {
                //     // 国际化组件
                //     path: '/i18n',
                //     component: () => import(/* webpackChunkName: "i18n" */ '../components/page/I18n.vue'),
                //     meta: { title: '国际化' }
                // },
                // {
                //     // 权限页面
                //     path: '/permission',
                //     component: () => import(/* webpackChunkName: "permission" */ '../components/page/Permission.vue'),
                //     meta: { title: '权限测试', permission: true }
                // },
                {
                    path: '/404',
                    hide: true,
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    hide: true,
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: { title: '403' }
                }
                // {
                //     path: '/donate',
                //     component: () => import(/* webpackChunkName: "donate" */ '../components/page/Donate.vue'),
                //     meta: { title: '支持作者' }
                // },
                // {
                //     path: 'userList',
                //     component: () => import('../components/page/user/UserList.vue'),
                //     meta: { title: '用户列表' }
                // },

                // {
                //     path: '/permission1',
                //     component: () => import('../components/page/auth/permission.vue'),
                //     meta: { title: '权限' }
                // },
                // {
                //     path: '/roleList',
                //     component: () => import('../components/page/auth/role.vue'),
                //     meta: { title: '角色' }
                // },
                // {
                //     path: '/managerList',
                //     component: () => import('../components/page/manager/ManagerList.vue'),
                //     meta: { title: '设置管理员' }
                // }
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../components/page/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '/register',
            component: () => import(/* webpackChunkName: "register" */ '../components/page/Register.vue'),
            meta: { title: '注册' }
        }
        // {
        //     path: '*',
        //     redirect: '/404'
        // }
    ]
});
