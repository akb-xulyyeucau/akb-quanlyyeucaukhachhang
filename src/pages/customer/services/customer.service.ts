import api from '../../../common/configs/apis/axios.config';

export const getCustomerPanition = async ({ page = 1, limit = 10, search = '',  sort = 'asc' , sortBy = 'name'}) => {
    try {
        const params: any = {page , limit , search , sort , sortBy} ;
        const response = await api.get('/customer/search' , {params});
        return response.data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định');
    }
} 

export const deleteCustomerById = async (customerId : string) => {
    try {
        const response = await api.delete(`/customer/${customerId}`);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định');
    }
} 

export const updateUserActive = async (userId: string, isActive: boolean) => {
    try {
        const response = await api.patch(`/user/active/${userId}`, { isActive });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định');
    }
}

export const updateCustomerById = async (cId : string , customerData : any) => {
    try {
        const response = await api.put(`/customer/${cId}` , customerData);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message || 'Lỗi không xác định');
    }
}