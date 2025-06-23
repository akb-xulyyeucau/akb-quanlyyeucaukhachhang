import api from "../configs/apis/axios.config";

export const downloadFile = async (filePath: string) => {
    try {
      const response = await api.get(`/document/download/${filePath}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  