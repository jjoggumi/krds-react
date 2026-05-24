import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LocalStorageImporter } from '@/dev/tools'
import { TextMain } from '@/components/uiux/page'

import '@/assets/css/hc-tailwind.css'
import '@/assets/css/hc-common.scss'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocalStorageImporter />
    <TextMain route="{}" authorities="[]" />
  </StrictMode>,
)
