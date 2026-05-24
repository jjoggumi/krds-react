import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HitalkVoteManager } from '@/components/hitalk/vote/manager/main'
import { LocalStorageImporter } from '@/dev/tools'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocalStorageImporter />
    <HitalkVoteManager />
  </StrictMode>,
) 