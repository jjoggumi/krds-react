export interface PutClassRoomExcludeStudentRequest {
   userId: string;
   isExcluded: boolean;
   studentIds: string[];
}