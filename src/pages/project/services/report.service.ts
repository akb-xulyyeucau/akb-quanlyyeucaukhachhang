import api from '../../../common/configs/apis/axios.config';

export const getReportByProjectId = async (projectId: string) => {
    try {
        const response = await api.get(`/report/project/${projectId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching report by project ID:', error);
        throw error;
        
    }
}


export const deleteReport = async (reportId: string) => {
    try {
        const response = await api.delete(`/report/${reportId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting report:', error);
        throw error;
        
    }
}