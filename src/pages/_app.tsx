import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { LoadingScreen } from '@components/LoadingScreen'

// Styles must be imported in _app
import '@styles/index.css'
import '@pooltogether/react-components/dist/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-spring-bottom-sheet/dist/style.css'
import '@styles/bottomSheet.css'
import '@styles/tools.css'
import '@styles/antd-custom.css'

const AppContainer = dynamic(
  () => import('../components/AppContainer').then((mod) => mod.AppContainer),
  {
    ssr: false,
    loading: () => <LoadingScreen />
  }
)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContainer>
      <Component {...pageProps} />
    </AppContainer>
  )
}

export default MyApp
