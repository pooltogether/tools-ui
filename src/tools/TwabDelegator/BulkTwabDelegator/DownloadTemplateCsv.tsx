import { ButtonSize, ButtonLink } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'

export const DownloadTemplateCsv = () => {
  return (
    <ButtonLink
      href='/bulk-delegation-template.csv'
      download
      size={ButtonSize.sm}
      className='flex items-center justify-center space-x-1'
    >
      <FeatherIcon icon='download' className='w-4 h-4' />
      <span>Download Template</span>
    </ButtonLink>
  )
}
