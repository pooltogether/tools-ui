import { useDelegationConfirmationStrings } from '@twabDelegator/hooks/useDelegationConfirmationStrings'

export const DelegationConfirmationList: React.FC<{ chainId: number; delegator: string }> = (
  props
) => {
  const { chainId, delegator } = props
  const { data: updateStrings } = useDelegationConfirmationStrings(chainId, delegator)

  return (
    <ul className='bg-darkened list-disc pr-8 pl-10 py-6 rounded-lg max-h-52 overflow-auto flex flex-col space-y-1'>
      {updateStrings.map((update, index) => (
        <li key={`update-${index}`}>{update}</li>
      ))}
    </ul>
  )
}
