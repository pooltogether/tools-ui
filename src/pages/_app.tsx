import type { AppProps } from 'next/app'
import { AppContainer } from '../components/AppContainer'

// Styles must be imported in _app
import '@styles/index.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-spring-bottom-sheet/dist/style.css'
import '@styles/bottomSheet.css'
import 'antd/dist/antd.css' // or 'antd/dist/antd.less'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContainer>
      <Component {...pageProps} />
    </AppContainer>
  )
}

export default MyApp
