import api from '../../../common/configs/apis/axios.config';

export const uploadDocument = async (document: {
  name: string;
  day: Date;
  sender: {
    _id: string;
    email: string;
    role: string;
    alias: string;
  };
  files: File[];
}) => {
  const formData = new FormData();
  formData.append('name', document.name);
  formData.append('day', document.day.toISOString());
  formData.append('sender', document.sender._id);
  
  document.files.forEach((file) => {
    formData.append(`files`, file);
  });

  try {
    const response = await api.post('/document/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi upload tài liệu:', error);
    throw error;
  }
};

export const updateTrashDocument = async (documentId: string) => {
  try {
    const response = await api.patch(`/document/trash/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa tài liệu:', error);
    throw error;
  }
}

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

export const deleteDocument = async (dId : string) => {
    try {
        const res = await api.delete(`/document/${dId}`);
        return res.data;
    } catch (error : any) {
        throw error;    
    }
}

export const updateDocument = async (documentId: string, formData: FormData) => {
  try {
    const response = await api.put(`/document/${documentId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
