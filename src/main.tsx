import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { BagProvider } from './bag'
import { NotFound } from './components/NotFound'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import './styles.css'

const rootRoute = createRootRoute({ component: () => <Outlet />, notFoundComponent: () => <NotFound /> })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })
const shopRoute = createRoute({ getParentRoute: () => rootRoute, path: '/shops/$vendorId', component: ShopPage })
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/shops/$vendorId/checkout', component: CheckoutPage })
const routeTree = rootRoute.addChildren([indexRoute, shopRoute, checkoutRoute])
const router = createRouter({ routeTree, scrollRestoration: true })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }

export default function Root() {
  return <BagProvider><RouterProvider router={router} /></BagProvider>
}
