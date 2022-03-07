import { DelegationListProps } from '.'

/**
 *
 * @param props
 * @returns
 */
export const LoadingState: React.FC<DelegationListProps> = (props) => {
  const { className } = props
  return <div className={className}>Loading...</div>
}
