import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { IconHeart } from '@tabler/icons-react'
import api from '../lib/api'
import ListingCard from '../components/ListingCard'
import { PageLoader, Empty } from '../components/ui'

export default function Wishlist() {
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: async () => (await api.get('/customer/wishlist')).data.data })
  if (isLoading) return <PageLoader />

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Wishlist</h1>
      {data?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <Empty title="Your wishlist is empty" subtitle="Save items you love to find them quickly later." icon={IconHeart}
          action={<Link to="/search" className="btn-primary">Browse</Link>} />
      )}
    </div>
  )
}
