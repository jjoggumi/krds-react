import {UserLevel} from "@/enums";

export const userNameOfMember = (member) =>{
  switch (member.userType) {
    case UserLevel.TEACHER:
      return `${member.user.userName} 선생님`;
    case UserLevel.STUDENT:
      return `${member.memberChildName} 학생`;
    case UserLevel.PARENTS:
      return `${member.memberChildName} 학부모(${member.user.userName})`;
    default:
      return `${member.user.userName}`;
  }
}