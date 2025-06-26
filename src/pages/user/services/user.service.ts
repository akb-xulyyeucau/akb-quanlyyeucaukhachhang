import api from '../../../common/configs/apis/axios.config';

export const getAllUsers = async ()=> {
    try {
        const response = await api.get('/user');
        const data = response.data;
        return data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
        
    }
}
export const createUser = async (data : any) => {
    try {
        const response = await api.post('/user', data);
        const res = response.data;
        return res;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const deleteUser = async (id: string) => {
    try {
        const response = await api.delete(`/user/${id}`);
        const data = response.data;
        return data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const updateUser = async (id: string , data : any) => {
    try {
        const response = await api.put(`/user/${id}`, data);
        const res = response.data;
        if(!res){
            return res.message
        }
        return res;
    } catch (error: any) {
         throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const getUsersPaging = async ({ page = 1, limit = 10, search = '', role = '', sort = 'asc', isActive = '' }) => {
    try {
          const params: any = { page, limit, search, sort };
          if (role) params.role = role;
          if (isActive !== '') {
              params.isActive = String(isActive);
          }
          const response = await api.get('/user/search', { params });
          return response.data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
};

export const getProfile = async (role : string , userId : string ) => {
    try {
        if(role === 'guest'){
            const response = await api.get(`/customer/${userId}`);
            return response.data;
        }
        else if(role === 'pm'){
            const response = await api.get(`/pm/${userId}`);
            return response.data;
        }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")      
        
    }
}

export const updateProfile = async (role : string , profileId : string , profileData : any) => {
    try {
        if(role === 'guest'){
            const response  = await api.put(`/customer/${profileId}` , profileData);
            return response.data;
        }else{
            const response = await api.put(`/pm/${profileId}` , profileData );
            response.data
        }
    } catch (error : any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")      

    }
}

export const createProfile = async (role : string  , profileData  : any) => {
    try {
        if(role === 'guest'){
            const response = await api.post('/customer', profileData);
            return response.data
        }else{
            const response = await api.post('/pm' , profileData);
            return response.data;
        }
    } catch (error : any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const deleteProfile = async (role : string , uId : string) => {
    try {
        if(role === 'guest'){
            const response = await api.delete(`/customer/user/${uId}`);
            return response.data;
        }else if(role === 'pm'){
            const response = await api.delete(`/pm/user/${uId}`);
            return response.data;
        }
        return { success: true, message: 'Không có profile cần xóa' };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi khi xóa profile")
    }
}

export const updateUserActive = async (userId: string, isActive: boolean) => {
    try {
        const response = await api.patch(`/user/active/${userId}`, { isActive });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái người dùng");
    }
}

// export const getMe = async (uId : string) => {
//     try {
//         const response = await api.get(`/user/me/${uId}`);
//         return response.data;
//     } catch (error : any) {
//          throw new Error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái người dùng");
//     }
// }

export const userStatistic = async () => {
    try {
        const response = await api.get(`/user/statistic`);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response?.data?.message)
    }
}