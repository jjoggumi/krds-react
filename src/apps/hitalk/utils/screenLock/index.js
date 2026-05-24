import ScreenLockController from "./ScreenLockController";

const screenLockController = new ScreenLockController();

export function useScreenLockController() {
  return screenLockController;
}