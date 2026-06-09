import DashboardLayout from './DashboardLayout'
import {
  IconLayoutDashboard, IconBox, IconReceipt2, IconStar, IconWallet, IconBuildingStore, IconMessage,
} from '@tabler/icons-react'

const nav = [
  { to: '/vendor', label: 'Dashboard', icon: IconLayoutDashboard, end: true },
  { to: '/vendor/listings', label: 'Listings', icon: IconBox },
  { to: '/vendor/orders', label: 'Orders', icon: IconReceipt2 },
  { to: '/vendor/messages', label: 'Messages', icon: IconMessage },
  { to: '/vendor/reviews', label: 'Reviews', icon: IconStar },
  { to: '/vendor/payouts', label: 'Payouts', icon: IconWallet },
  { to: '/vendor/profile', label: 'Shop Profile', icon: IconBuildingStore },
]

export default function VendorLayout() {
  return <DashboardLayout title="Vendor" nav={nav} />
}
