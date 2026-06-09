import DashboardLayout from './DashboardLayout'
import {
  IconChartBar, IconBuildingStore, IconReceipt2, IconWallet, IconLanguage,
} from '@tabler/icons-react'

const nav = [
  { to: '/admin', label: 'Overview', icon: IconChartBar, end: true },
  { to: '/admin/vendors', label: 'Vendors', icon: IconBuildingStore },
  { to: '/admin/orders', label: 'Orders', icon: IconReceipt2 },
  { to: '/admin/payouts', label: 'Payouts', icon: IconWallet },
  { to: '/admin/synonyms', label: 'Search Synonyms', icon: IconLanguage },
]

export default function AdminLayout() {
  return <DashboardLayout title="Admin" nav={nav} />
}
