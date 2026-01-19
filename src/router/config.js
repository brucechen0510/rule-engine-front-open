import TabsView from '@/layouts/tabs/TabsView'
import BlankView from '@/layouts/BlankView'
// import PageView from '@/layouts/PageView'

// 路由配置
const options = {
    routes: [
        {
            path: '/login',
            name: '登录页',
            component: () => import('@/pages/login')
        },
        {
            path: '*',
            name: '404',
            component: () => import('@/pages/exception/404'),
        },
        {
            path: '/403',
            name: '403',
            component: () => import('@/pages/exception/403'),
        },
        {
            path: '/',
            name: '首页',
            component: TabsView,
            redirect: '/components/Inputparameter',
            children: [
                {
                    path: 'components',
                    name: '组件管理',
                    meta: {
                        icon: 'gold'
                    },
                    component: BlankView,
                    children: [
                        {
                            path: '/Inputparameter',
                            name: '参数',
                            meta: {
                                page: {
                                    closable: true
                                }
                            },
                            component: () => import('@/pages/components/Inputparameter'),
                        },
                        {
                            path: '/variable',
                            name: '变量',
                            meta: {
                                page: {
                                    closable: true
                                }
                            },
                            component: () => import('@/pages/components/variable'),
                        },
                        {
                            path: '/function',
                            name: '函数',
                            meta: {
                                page: {
                                    closable: true
                                }
                            },
                            component: () => import('@/pages/components/function'),
                        },
                    ]
                },
                {
                    path: 'rulemanagement',
                    name: '规则管理',
                    meta: {
                        icon: 'appstore'
                    },
                    component: BlankView,
                    children: [
                        {
                            path: '/generalrule',
                            name: '普通规则',
                            meta: {
                                page: {
                                    closable: true
                                }
                            },
                            component: () => import('@/pages/rulemanagement/generalrule/list'),
                        },
                        {
                            path: '/generalRuleRouter/:id',
                            name: '规则(...)',
                            meta: {
                                invisible: true
                            },
                            component: () => import('@/pages/rulemanagement/generalrule/router'),
                        },
                        {
                            path: '/generalRuleView/:id/:version',
                            name: '规则(...)',
                            meta: {
                                invisible: true
                            },
                            component: () => import('@/pages/rulemanagement/generalrule/view'),
                        },
                    ]
                }
            ]
        },
    ]
};

export default options
