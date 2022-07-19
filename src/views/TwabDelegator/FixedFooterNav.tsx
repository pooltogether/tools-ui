export const FixedFooterNav: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return (
    <>
      {/* Desktop */}
      <div className='hidden xs:flex w-full items-center justify-between mb-20'>{children}</div>
      {/* Mobile */}
      <div
        className='flex xs:hidden items-center fixed b-0 l-0 r-0 h-20 bg-pt-purple-bright justify-between space-x-2 px-2'
        style={{ zIndex: 3 }}
      >
        {children}
      </div>
    </>
  )
}
