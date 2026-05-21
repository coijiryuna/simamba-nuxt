export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  // Jika mencoba akses /admin tapi belum login
  if (to.path.startsWith('/admin') && !loggedIn.value) {
    return navigateTo('/login')
  }

  // Jika sudah login tapi malah mau ke /login
  if (to.path === '/login' && loggedIn.value) {
    return navigateTo('/admin')
  }
})
