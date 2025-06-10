import api from '../../common/configs/apis/axios.config';

export const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error : any ) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
  };