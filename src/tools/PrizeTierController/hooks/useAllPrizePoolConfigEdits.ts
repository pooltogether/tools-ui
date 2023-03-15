import { allCombinedPrizeTiersAtom } from '@prizeTierController/atoms'
import { useAllPrizeTierHistoryData } from '@prizeTierController/hooks/useAllPrizeTierHistoryData'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import { PrizePoolEditHistory } from '@prizeTierController/interfaces'
import { checkForPrizeEdits } from '@prizeTierController/utils/checkForPrizeEdits'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

export const useAllPrizePoolConfigEdits = () => {
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()
  const { data, isFetched } = useAllPrizeTierHistoryData()
  const [combinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)

  return useMemo(() => {
    if (isFetched) {
      return prizeTierHistoryContracts.map((contract) => {
        if (combinedPrizeTiers[contract.chainId]) {
          const oldConfig = data[contract.chainId][contract.address]
          const newConfig = combinedPrizeTiers[contract.chainId][contract.address]
          const edits = checkForPrizeEdits(oldConfig, newConfig)
          const prizePoolEditHistory: PrizePoolEditHistory = {
            prizeTierHistoryContract: contract,
            oldConfig,
            newConfig,
            edits
          }
          return prizePoolEditHistory
        }
      })
    }
  }, [prizeTierHistoryContracts, data, isFetched, combinedPrizeTiers])
}
