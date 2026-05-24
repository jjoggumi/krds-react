import { getCurrentInstance } from "vue";


const useEducationLetterApis = () => {
  // @ts-ignore
  const { proxy } = getCurrentInstance();

  const fetchSchools = async () => {
    try {
      const { data } = await proxy.$axios.get('/educationLetters/schools');
      return data._embedded?.elSchools || [];
    } catch (error) {
        console.error('Failed to fetch schools:', error);
    }
  };

  return {
    fetchSchools,
  };

};

export { useEducationLetterApis };