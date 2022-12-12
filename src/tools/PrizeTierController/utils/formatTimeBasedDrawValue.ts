import { DRAWS_PER_DAY } from '@prizeTierController/config'

export const getTimeBasedDrawValue = (
  value: number,
  timespan: 'day' | 'week' | 'month' | 'year',
  options?: { noDecimals?: boolean }
) => {
  let timespanMultiplier = 1
  if (timespan === 'week') {
    timespanMultiplier = 7
  } else if (timespan === 'month') {
    timespanMultiplier = 365 / 12
  } else if (timespan === 'year') {
    timespanMultiplier = 365
  }

  const timeBasedDrawValue = value * DRAWS_PER_DAY * timespanMultiplier

  if (options?.noDecimals || timeBasedDrawValue >= 100) {
    return timeBasedDrawValue.toLocaleString('en', {
      maximumFractionDigits: 0
    })
  } else if (timeBasedDrawValue >= 10) {
    return timeBasedDrawValue.toLocaleString('en', {
      maximumFractionDigits: 1
    })
  } else if (timeBasedDrawValue < 0) {
    return timeBasedDrawValue.toLocaleString('en', {
      maximumFractionDigits: 3
    })
  } else {
    return timeBasedDrawValue.toLocaleString('en', {
      maximumFractionDigits: 2
    })
  }
}
