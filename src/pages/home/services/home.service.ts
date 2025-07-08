import api from '../../../common/configs/apis/axios.config';

export const getHomeData = async (userRole : string ,mode : string , startDate : string , endDate : string) => {
    try {
        if(userRole === 'guest'){
            const response = await api.get(`/home/customer-statistic?mode=${mode}&startDate=${startDate}&endDate=${endDate}`);
            return response.data;
        }
        const response = await api.get(`/home/admin-statistic?mode=${mode}&startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định');
    }
}