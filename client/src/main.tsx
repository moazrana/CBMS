import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './index.css'
import './styles/loading.css'
import App from './App.tsx'
import { LoadingProvider } from './context/LoadingContext'

// const theme = extendTheme({})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </StrictMode>
)
