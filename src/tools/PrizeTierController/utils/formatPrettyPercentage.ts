export const formatPrettyPercentage = (value: number) => {
  return (value / 10 ** 7).toLocaleString() + '%'
}
