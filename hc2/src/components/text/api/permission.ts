import { apiCall } from "@/apis/request";
import {
  Permission, PermissionActionType,
  PermissionFeatureType,
  PermissionSort,
  PostEletterResponse,
  PostTextManagersSearchResponse,
} from '../types/permission';


export const postTextManagersSearch = async (schoolId: string, sort?: PermissionSort) => {
   const { _embedded }: PostTextManagersSearchResponse = await apiCall(`POST /schools/${schoolId}/text/managers/search`, { 
      body: sort ? {
         sort: sort.sort,
         direction: sort.direction
      } : {},
   });
   return { lists: _embedded?.lists };
};

export const postTextManagersEletter = async (schoolId: string) => {
   const { _embedded}: PostEletterResponse = await apiCall(`POST /schools/${schoolId}/text/managers/eletter`, { body: {} })
   return { lists: _embedded?.lists };
}

export const postTextManagers = async (schoolId: string, userIds: string[]) => {
   return await apiCall(`POST /schools/${schoolId}/text/managers`, { body: { userIds: userIds } })
}

export const patchTextManagersPermission = async (schoolId: string, userId: string, permissions: Permission[]) => {
   return await apiCall(`PATCH /schools/${schoolId}/text/managers/permission`, { body: { userId: userId, permissions: permissions } })
}

export const patchTextManagersRemove = async (schoolId: string, userIds: string[]) => {
   return await apiCall(`PATCH /schools/${schoolId}/text/managers/remove`, { body: { userIds: userIds }})
}

export const checkPermission = async (schoolId: string, { actionType, featureType }: { actionType?: PermissionActionType, featureType?: PermissionFeatureType }) => {
  return await apiCall(`POST /schools/${schoolId}/text/permission/check`, { body: { actionType, featureType } })
}