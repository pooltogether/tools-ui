import classNames from 'classnames'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface AppInfo {
  titleKey: string
  descriptionKey: string
  href: string
  // icon:
}

const APPS_TO_LIST: AppInfo[] = [
  {
    titleKey: 'delegate',
    descriptionKey: 'delegate',
    href: 'delegate'
  },
  {
    titleKey: 'rewards',
    descriptionKey: 'twab rewards',
    href: 'twab-rewards'
  }
]

/**
 * App list is the list of apps to display in the App Index
 * @returns
 */
export const AppIndexList: React.FC = () => {
  return (
    <ul className='flex flex-col space-y-4'>
      {APPS_TO_LIST.map((appInfo) => (
        <AppLink key={appInfo.href} {...appInfo} />
      ))}
    </ul>
  )
}

const AppLink: React.FC<AppInfo> = (props) => {
  const { titleKey, descriptionKey, href } = props
  const { t, i18n } = useTranslation()
  return (
    <Link href={href}>
      <a>
        <ListItemContainer>
          <span>{t(titleKey)}</span>
          <span>{descriptionKey}</span>
        </ListItemContainer>
      </a>
    </Link>
  )
}

const ListItemContainer: React.FC = (props) => (
  <li {...props} className='p-4 rounded bg-card flex flex-col items-center' />
)
