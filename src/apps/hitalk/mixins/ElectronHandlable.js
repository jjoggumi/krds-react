import { useElectronController } from '@/apps/hitalk/utils'
import { method } from 'lodash'

const electronController = useElectronController()

export default {
  computed: {
    isUnderElectron() {
      return electronController.isUnderElectron()
    },
    electronController() {
      return electronController
    },
    appVersion() {
      return electronController.getAppVersion()
    }
  },
  methods: {
    openExternal(url) {
      return electronController.openExternal(url)
    },
    quit() {
      return electronController.quit()
    },
  }
}