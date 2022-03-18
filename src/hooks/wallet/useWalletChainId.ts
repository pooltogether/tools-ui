import { useNetwork } from 'wagmi'

export const useWalletChainId = () => {
  const [{ data, error, loading }, switchNetwork] = useNetwork()
  return data?.chain?.id
}
