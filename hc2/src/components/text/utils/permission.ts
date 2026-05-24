import { SimplePermission } from '../constants';
import { Permission, PermissionFeatureType } from '../types';


export const getPermission = (permissions: Permission[]): SimplePermission => {
   if (!permissions) return SimplePermission.NONE;
   const hasContact = permissions.some(p => p.featureType === PermissionFeatureType.CONTACT && p.isAllowed);
   const hasSendMessage = permissions.some(p => p.featureType === PermissionFeatureType.SEND_MESSAGE && p.isAllowed);

   if (hasContact && hasSendMessage) {
      return SimplePermission.ALL;
   }

   if (hasSendMessage) {
      return SimplePermission.SMS;
   }

   return SimplePermission.NONE;
};

export const toPermissions = (permission: SimplePermission): Permission[] => {
   return [
      {
         featureType: PermissionFeatureType.CONTACT,
         actionType: 'ALL',
         scopeType: 'ALL',
         isAllowed: permission === SimplePermission.ALL
      },
      {
         featureType: PermissionFeatureType.SEND_MESSAGE,
         actionType: 'ALL',
         scopeType: 'ALL',
         isAllowed: permission === SimplePermission.ALL || permission === SimplePermission.SMS
      }
   ]
}