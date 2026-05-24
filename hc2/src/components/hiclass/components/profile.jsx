import Style from './profile.module.css';
import { env } from '@/supporters/migrations';

export const defaultProfileImage = 'https://' + env.BASE_CDN_URI + "/static/images/user_profile_default.png"

export const nameOf = ({userType, userName, memberChildName, childName, ...user}) => (
  ({ TEACHER: () => `${userName} 선생님`,
     STUDENT: () => childName || memberChildName ? `${memberChildName || childName} 학생(${userName})` : `${userName} 학생`,
     PARENTS: () => childName || memberChildName ? `${memberChildName || childName} 학부모 (${userName})` : `${userName} 학부모님`
  }[userType] || (() => userName))()
)

export const Profile = ({ user = {}, className = '', style, description, noImg=false, showMeMarker=false }) => {
  return (
    <div className={`${Style.profile} ${className} profile`} style={style}>
      {!noImg && <img src={user?.userPhoto || defaultProfileImage}/>}
      <div className={`${Style['profile-info']} profile-info`}>
        <span className={`${Style['profile-name']} profile-name`}>
          { showMeMarker && user?.userId === localStorage.uuid && <span className={Style['me']}>나</span> }
          {user && nameOf(user)}
        </span>
        { description ? <div className={Style['profile-description']}>{description}</div> : null }
      </div>
    </div>
  );
}