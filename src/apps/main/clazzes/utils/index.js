import ClassErrorManager from "@/apps/main/clazzes/utils/ErrorManager";

const errorManager = new ClassErrorManager()

export function useClassErrorManager() {
    return errorManager
}