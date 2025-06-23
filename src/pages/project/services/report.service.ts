import api from '../../../common/configs/apis/axios.config';
// import type { IReport, IPayloadReport } from '../interfaces/project.interface';

export const getReportByProjectId = async (projectId: string) => {
    try {
        const response = await api.get(`/report/project/${projectId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching report by project ID:', error);
        throw error;
    }
}

export const createReport = async (formData: FormData) => {
    try {
        const response = await api.post('/report/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating report:', error);
        throw error;
    }
}

export const updateReport = async (reportId: string, formData: FormData) => {
    try {
        const response = await api.put(`/report/${reportId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating report:', error);
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