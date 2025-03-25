// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import SignUpPage from '../components/SignUp.vue';
import DashboardAdmin from '../dashboard/DashboardAdmin.vue';
import DashboardUser from '../dashboard/DashboardUser.vue';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    { path: '/signup', component: SignUpPage },
    { path: '/dashboard/admin', component: DashboardAdmin },
    { path: '/dashboard/user', component: DashboardUser }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// ✅ Giriş kontrolü (route guard)
router.beforeEach((to, from, next) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const protectedRoutes = ['/dashboard/admin', '/dashboard/user'];

    if (protectedRoutes.includes(to.path) && !user) {
        next('/login');
    } else {
        next();
    }
});


export default router;