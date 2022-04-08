// import {
//   promotionCreationsAtom,
//   promotionFundsAtom,
//   promotionUpdatesAtom
// } from '@twabRewards/atoms'
// import { Promotion, PromotionFund, PromotionId, PromotionUpdate } from '@twabRewards/interfaces'
// import { useAtom } from 'jotai'
// import { useAccountsPromotions } from './useAccountsPromotions'

// /**
//  * @param chainId
//  * @param account
//  * @returns
//  */
// export const useAccountsUpdatedPromotions = (chainId: number, account: string) => {
//   const useQueryResult = useAccountsPromotions(chainId, account)
//   const [promotionUpdates] = useAtom(promotionUpdatesAtom)
//   const [promotionCreations] = useAtom(promotionCreationsAtom)
//   const [promotionFunds] = useAtom(promotionFundsAtom)

//   if (!useQueryResult.isFetched) {
//     return {
//       ...useQueryResult,
//       data: null
//     }
//   }

//   console.log(useQueryResult.data)
//   const data: {
//     // promotionId: PromotionId
//     promotion?: Promotion
//     // promotionUpdate?: PromotionUpdate
//     // promotionCreation?: PromotionUpdate
//     // promotionFund?: PromotionFund
//   }[] = useQueryResult.data?.map((promotionData) => {
//     const { promotion } = promotionData
//     console.log(promotion)
//     // const promotionUpdate = promotionUpdates.find(
//     //   (promotionUpdate) =>
//     //     promotionUpdate.account === promotionId.account && promotionUpdate.slot.eq(promotionId.slot)
//     // )
//     // const promotionFund = promotionFunds.find(
//     //   (promotionFund) =>
//     //     promotionFund.account === promotionId.account && promotionFund.slot.eq(promotionId.slot)
//     // )
//     // const promotionCreation = promotionCreations.find(
//     //   (promotionCreation) =>
//     //     promotionCreation.account === promotionId.account &&
//     //     promotionCreation.slot.eq(promotionId.slot)
//     // )
//     return {
//       promotion
//       // promotionUpdate,
//       // promotionCreation,
//       // promotionFund
//     }
//   })

//   // Add in promotion creations if they aren't there
//   // promotionCreations.forEach((promotionCreation) => {
//   //   const isAdded = data.some(
//   //     (promotionData) => promotionData.promotionCreation === promotionCreation
//   //   )
//   //   if (!isAdded) {
//   //     const promotionFund = promotionFunds.find(
//   //       (promotionFund) =>
//   //         promotionFund.account === promotionCreation.account &&
//   //         promotionFund.slot.eq(promotionCreation.slot)
//   //     )
//   //     data.push({
//   //       promotionId: {
//   //         slot: promotionCreation.slot,
//   //         account: promotionCreation.account
//   //       },
//   //       promotionCreation: promotionCreation,
//   //       promotionFund
//   //     })
//   //   }
//   // })

//   // data.sort((a, b) => (a.promotionId.slot.gt(b.promotionId.slot) ? 1 : -1))

//   return {
//     ...useQueryResult,
//     data
//   }
// }
