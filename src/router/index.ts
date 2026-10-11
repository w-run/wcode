import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardPage.vue'),
    },
    {
      path: '/repos',
      name: 'repo-list',
      component: () => import('@/views/repository/RepoListPage.vue'),
    },
    {
      path: '/repos/:owner/:name',
      name: 'repo-detail',
      component: () => import('@/views/repository/RepoDetailPage.vue'),
      props: true,
    },
  ],
})

export default router
