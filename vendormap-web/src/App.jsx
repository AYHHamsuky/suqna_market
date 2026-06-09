import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/auth'

import PublicLayout from './layouts/PublicLayout'
import VendorLayout from './layouts/VendorLayout'
import AdminLayout from './layouts/AdminLayout'

import Landing from './pages/Landing'
import Search from './pages/Search'
import ListingDetail from './pages/ListingDetail'
import VendorPublic from './pages/VendorPublic'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MockCheckout from './pages/MockCheckout'
import CheckoutCallback from './pages/CheckoutCallback'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Wishlist from './pages/Wishlist'
import Messages from './pages/Messages'
import Login from './pages/auth/Login'
import RegisterCustomer from './pages/auth/RegisterCustomer'
import RegisterVendor from './pages/auth/RegisterVendor'

import VendorDashboard from './pages/vendor/Dashboard'
import VendorListings from './pages/vendor/Listings'
import VendorOrders from './pages/vendor/Orders'
import VendorProfile from './pages/vendor/Profile'
import VendorPayouts from './pages/vendor/Payouts'
import VendorReviews from './pages/vendor/Reviews'

import AdminDashboard from './pages/admin/Dashboard'
import AdminVendors from './pages/admin/Vendors'
import AdminOrders from './pages/admin/Orders'
import AdminPayouts from './pages/admin/Payouts'
import AdminSynonyms from './pages/admin/Synonyms'

function RequireRole({ role, children }) {
  const { token, user } = useAuthStore()
  const location = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Standalone marketing landing page (own nav + footer) */}
      <Route path="/" element={<Landing />} />

      {/* Public + customer */}
      <Route element={<PublicLayout />}>
        <Route path="/search" element={<Search />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/vendors/:slug" element={<VendorPublic />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterCustomer />} />
        <Route path="/register/vendor" element={<RegisterVendor />} />

        {/* Authenticated customer area */}
        <Route path="/checkout" element={<RequireRole><Checkout /></RequireRole>} />
        <Route path="/checkout/mock" element={<RequireRole><MockCheckout /></RequireRole>} />
        <Route path="/checkout/callback" element={<RequireRole><CheckoutCallback /></RequireRole>} />
        <Route path="/orders" element={<RequireRole><Orders /></RequireRole>} />
        <Route path="/orders/:id" element={<RequireRole><OrderDetail /></RequireRole>} />
        <Route path="/wishlist" element={<RequireRole><Wishlist /></RequireRole>} />
        <Route path="/messages" element={<RequireRole><Messages /></RequireRole>} />
        <Route path="/messages/:id" element={<RequireRole><Messages /></RequireRole>} />
      </Route>

      {/* Vendor dashboard */}
      <Route
        path="/vendor"
        element={
          <RequireRole role="vendor">
            <VendorLayout />
          </RequireRole>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="listings" element={<VendorListings />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="reviews" element={<VendorReviews />} />
        <Route path="payouts" element={<VendorPayouts />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="messages" element={<Messages embedded />} />
      </Route>

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="synonyms" element={<AdminSynonyms />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
