import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
// import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './index.css'
import './styles/loading.css'
import App from './App.tsx'
import { LoadingProvider } from './context/LoadingContext'
import { store } from './store/store'

// const theme = extendTheme({})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </Provider>
  </StrictMode>
)
