import { defineConfig, mergeConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import shared from '../../vite.config.shared'

// https://vitejs.dev/config/
export default mergeConfig(shared, defineConfig({
  plugins: [react()],
}))
