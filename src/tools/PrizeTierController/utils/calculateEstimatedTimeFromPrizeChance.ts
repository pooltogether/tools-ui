import { i18nTranslate } from '@pooltogether/react-components'
import { formatDailyCountToFrequency } from '@pooltogether/utilities'

export const calculateEstimatedTimeFromPrizeChance = (prizeChance: number, t: i18nTranslate) => {
  const result = formatDailyCountToFrequency(prizeChance)
  if (result.frequency !== 0) {
    if (result.unit === 'day') {
      if (result.frequency <= 1.5) {
        return t('daily')
      } else {
        return t('everyNDays', { n: result.frequency.toFixed(0) })
      }
    } else if (result.unit === 'week') {
      return t('everyNWeeks', { n: result.frequency.toFixed(0) })
    } else if (result.unit === 'month') {
      return t('everyNMonths', { n: result.frequency.toFixed(0) })
    } else {
      return t('everyNYears', { n: result.frequency.toFixed(0) })
    }
  } else {
    return t('never')
  }
}
