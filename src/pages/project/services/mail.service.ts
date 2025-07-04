import api from '../../../common/configs/apis/axios.config';

export const sendEmail = async (data: any) => {
    try {
        const response = await api.post('/mail/send-mail-template', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}