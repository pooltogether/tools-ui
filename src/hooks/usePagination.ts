import { useMemo, useState } from 'react'

export const usePagination = (
  listLength: number,
  pageSize = 25,
  options?: {
    onNext?: (page?: number) => void
    onPrevious?: (page?: number) => void
  }
) => {
  const [page, setPage] = useState(0)

  return useMemo(() => {
    return {
      page,
      setPage,
      pageSize,
      next:
        (page + 1) * pageSize + pageSize > listLength
          ? null
          : () => {
              setPage(page + 1)
              options?.onNext?.(page + 1)
            },
      previous:
        page === 0
          ? null
          : () => {
              setPage(page - 1)
              options?.onPrevious?.(page - 1)
            }
    }
  }, [listLength, page])
}
