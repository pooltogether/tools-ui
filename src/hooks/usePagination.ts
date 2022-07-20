import { useMemo, useState } from 'react'

export const usePagination = (
  listLength: number,
  pageSize = 25,
  options?: {
    onNext?: (page?: number) => void
    onLast?: (page?: number) => void
    onFirst?: (page?: number) => void
    onPrevious?: (page?: number) => void
  }
) => {
  const [page, setPage] = useState(0)

  return useMemo(() => {
    return {
      page,
      setPage,
      pageSize,
      last: () => {
        console.log({ pageSize, listLength })
        const page = Math.ceil(listLength / pageSize) - 1
        setPage(page)
        options?.onLast?.(page)
      },
      first: () => {
        setPage(0)
        options?.onFirst?.(0)
      },
      next:
        page * pageSize + pageSize < listLength
          ? () => {
              setPage(page + 1)
              options?.onNext?.(page + 1)
            }
          : null,
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
