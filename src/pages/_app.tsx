import React from 'react'
import type { AppProps } from 'next/app'
import { AppContainer } from '@components/AppContainer'

// CSS
import '@styles/index.css'
import '@pooltogether/react-components/dist/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-spring-bottom-sheet/dist/style.css'
import '@styles/bottomSheet.css'
import '@styles/tools.css'
import '@styles/antd-custom.css'

const App: React.FC<AppProps> = (props) => {
  return <AppContainer {...props} />
}

export default App
