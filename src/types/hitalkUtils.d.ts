declare module '@/apps/hitalk/utils' {
  export function useElectronController(): ElectronController;
  export interface ElectronController {
    isUnderElectron(): boolean;
  }
}