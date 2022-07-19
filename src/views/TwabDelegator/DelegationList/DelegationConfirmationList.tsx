import { usePagination } from '@hooks/usePagination'
import { useDelegationConfirmationStrings } from '@twabDelegator/hooks/useDelegationConfirmationStrings'
import { useMemo } from 'react'

export const DelegationConfirmationList: React.FC<{ chainId: number; delegator: string }> = (
  props
) => {
  const { chainId, delegator } = props
  const _updateStrings = useDelegationConfirmationStrings(chainId, delegator)

  const { page, pageSize, next, previous } = usePagination(_updateStrings?.length, 25, {
    onNext: () => document.getElementById('updates-list').scrollTo({ top: 0 }),
    onPrevious: () => document.getElementById('updates-list').scrollTo({ top: 0 })
  })

  const updateStrings = useMemo(
    () => _updateStrings.slice(page * pageSize, page * pageSize + pageSize),
    [page]
  )

  return (
    <div
      className='bg-darkened pr-8 pl-10 py-6 rounded-lg max-h-52 overflow-auto'
      id='updates-list'
    >
      <ul className='list-disc flex flex-col space-y-1'>
        {updateStrings.map((update, index) => (
          <li key={`update-${index}`}>{update}</li>
        ))}
      </ul>
      <div className='flex mt-4 -ml-2 text-xxs'>
        {!!previous && (
          <button className='mr-auto' onClick={previous}>
            Previous
          </button>
        )}
        {!!next && (
          <button className='ml-auto' onClick={next}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}
