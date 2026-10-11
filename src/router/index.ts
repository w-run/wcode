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
      path: '/search',
      name: 'search',
      component: () => import('@/views/search/SearchPage.vue'),
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
    {
      path: '/repos/:owner/:name/tree/:refName/:path*',
      name: 'repo-tree',
      component: () => import('@/views/repository/CodeTreePage.vue'),
      props: true,
    },
    {
      path: '/repos/:owner/:name/blob/:refName/:path+',
      name: 'repo-blob',
      component: () => import('@/views/repository/CodeBlobPage.vue'),
      props: true,
    },
    {
      path: '/repos/:owner/:name/issues',
      name: 'repo-issues',
      component: () => import('@/views/issue/RepoIssuesPage.vue'),
      props: true,
    },
    {
      path: '/repos/:owner/:name/issues/:number',
      name: 'issue-detail',
      component: () => import('@/views/issue/IssueDetailPage.vue'),
      props: true,
    },
    {
      path: '/repos/:owner/:name/pulls',
      name: 'repo-pulls',
      component: () => import('@/views/pull/RepoPullsPage.vue'),
      props: true,
    },
    {
      path: '/repos/:owner/:name/pulls/:number',
      name: 'pull-detail',
      component: () => import('@/views/pull/PullDetailPage.vue'),
      props: true,
    },
    {
      path: '/repos/:owner/:name/settings/mirrors',
      name: 'repo-mirrors',
      component: () => import('@/views/settings/MirrorPage.vue'),
      props: true,
    },
    {
      path: '/r/:owner/:name',
      name: 'landing',
      component: () => import('@/views/landing/LandingPage.vue'),
      props: true,
      meta: { bare: true },
    },
  ],
})

export default router
