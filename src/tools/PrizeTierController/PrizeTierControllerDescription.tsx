import classNames from 'classnames'
import { useTranslation } from 'next-i18next'

export const PrizeTierControllerDescription: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <p className='text-accent-1 text-xxs'>{t('prizeTierControllerDescription')}</p>
    </div>
  )
}
