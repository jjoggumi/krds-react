import { getCurrentInstance } from "vue";

const useHiClassApi = () => {
  // @ts-ignore
  const { proxy } = getCurrentInstance();

  const fetchSchool = async (schoolId: string) => {
    try {
      const { data } = await proxy.$axios.get(`/schools/${schoolId}`);
      return data;
    }
    catch (error) {
      console.error('Failed to fetch school:', error);
    }
  };

  return {
    fetchSchool,
  };

};

export { useHiClassApi };