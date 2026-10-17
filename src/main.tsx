import { createRootRoute, createRoute, createRouter, Outlet, redirect, RouterProvider } from '@tanstack/react-router'
import { BagProvider } from './bag'
import { categoryById } from './catalog'
import { InventoryProvider } from './inventory'
import { NeighbourhoodProvider } from './neighbourhood'
import { VendorAuthProvider } from './vendorAuth'
import { VendorLoginPage } from './pages/VendorLoginPage'
import { VendorProductsPage } from './pages/VendorProductsPage'
import { NotFound } from './components/NotFound'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import './styles.css'
import './vendor.css'

const rootRoute = createRootRoute({ component: () => <Outlet />, notFoundComponent: () => <NotFound /> })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })
export type ShopSearch = { cat?: string, page?: number }

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shops/$vendorId',
  component: ShopPage,
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const page = Number(search.page)
    return {
      cat: typeof search.cat === 'string' && categoryById.has(search.cat) ? search.cat : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    }
  },
})
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/shops/$vendorId/checkout', component: CheckoutPage })
const vendorIndexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/vendor', beforeLoad: () => { throw redirect({ to: '/vendor/products' }) } })
const vendorLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/vendor/login', component: VendorLoginPage })
const vendorProductsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/vendor/products', component: VendorProductsPage })
const routeTree = rootRoute.addChildren([indexRoute, shopRoute, checkoutRoute, vendorIndexRoute, vendorLoginRoute, vendorProductsRoute])
const router = createRouter({ routeTree, scrollRestoration: true })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }

export default function Root() {
  return <VendorAuthProvider>
    <InventoryProvider>
      <NeighbourhoodProvider><BagProvider><RouterProvider router={router} /></BagProvider></NeighbourhoodProvider>
    </InventoryProvider>
  </VendorAuthProvider>
}
