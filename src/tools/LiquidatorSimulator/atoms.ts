import { atom } from 'jotai'
import { ChartData, SimulatorConfig } from './interfaces'

export const chartDataAtom = atom<ChartData[]>(undefined as ChartData[])
export const SimulatorConfigAtom = atom<SimulatorConfig>(undefined as SimulatorConfig)
export const isSimulatingStateAtom = atom<boolean>(false)
export const hasSimulatedStateAtom = atom<boolean>(false)
