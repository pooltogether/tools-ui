import { Chain } from 'wagmi'

export const SUPPORTED_CHAINS: { [key: string]: Chain & { iconURL: string | { src: string } } } = {}
