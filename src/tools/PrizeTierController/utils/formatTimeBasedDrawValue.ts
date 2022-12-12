import { DRAWS_PER_DAY } from '@prizeTierController/config'

export const getTimeBasedDrawValue = (value: number, options?: { noDecimals?: boolean }) => {
  const timeBasedDrawValue = value * DRAWS_PER_DAY
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
