import { createRouter, createWebHistory } from 'vue-router';//和vue2 路由不同
const routerHistory = createWebHistory();

const router = createRouter({
  history: routerHistory,//history写法不同
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      component: () => import(`@/views/Home.vue`),
    },
    {
      name: 'swipe',
      path: '/swipe',
      component: () => import(`@/views/swipe/LayerSwipe.vue`)
    },
    {
      name: 'swipeNew',
      path: '/swipeNew',
      component: () => import(`@/views/swipe/LayerSwipeNew.vue`)
    },
    {
      name: 'swipeHide',
      path: '/swipeHide',
      component: () => import(`@/views/swipe/LayerSwipeHide.vue`)
    },
    {
      name: 'doubleScreen',
      path: '/doubleScreen',
      component: () => import(`@/views/DoubleScreen.vue`)
    },
    {
      name: 'multiBaseMap',
      path: '/multiBaseMap',
      component: () => import(`@/views/MultiBaseMap.vue`)
    }
  ],
});

export default router;