import api from '../../../common/configs/apis/axios.config';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '../../../common/stores/auth/authSelector';

export const uploadDocuments = async (documents: any[]) => {
  const formData = new FormData();
  const user = useSelector(selectAuthUser); // Lấy user từ Redux store

  documents.forEach((doc, index) => {
    formData.append(`documents[${index}][name]`, doc.name);
    formData.append(`documents[${index}][day]`, doc.day.toISOString());
    formData.append(`documents[${index}][sender]`, user?.id || 'anonymous'); // Sử dụng user.id từ Redux
    doc.files.forEach((file: any, fileIndex: number) => {
      if (file.originFileObj) {
        formData.append(`documents[${index}][files][${fileIndex}]`, file.originFileObj);
      }
    });
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