import { getCurrentInstance } from "vue";


const useUserApis = () => {
  // @ts-ignore
  const { proxy } = getCurrentInstance();

  const fetchUserInfo = async (userId: string) => {
    try {
      const { data } = await proxy.$axios.get(`/users/${userId}`);
      return data || {};
    } catch (error) {
        console.error('Failed to fetch schools:', error);
    }
  };

  return {
    fetchUserInfo
  };

};

export { useUserApis };