import { useQuery } from '@tanstack/react-query'
import api from './api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => (await api.get('/categories')).data.data,
  })
}
