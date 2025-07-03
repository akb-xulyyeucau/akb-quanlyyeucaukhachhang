import api from '../../../common/configs/apis/axios.config';
import type { IProject } from '../interfaces/project.interface';

export const getAllProject = async (queryParams?: string) => {
    try {
        const url = queryParams ? `/project?${queryParams}` : '/project';
        const response = await api.get(url);
        return response.data;
    } catch (error: any) {
        return error.message;
    }
}

export const getProjectRequest = async () => {
    try {
        const res = await api.get('/project/request?isActive=false');
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const createProject = async (projectData : IProject) => {
    try {
        const res = await api.post('/project' , projectData);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const updateProject = async (projectId: string, projectData: IProject) => {
    try {
        const res = await api.put(`/project/${projectId}`, projectData);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const deleteProject = async (projectId: string) => {
    try {
        const res = await api.delete(`/project/${projectId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const autoSeachCustomer = async (search: string) => {
    try {
        const res = await api.get(`/customer/auto-search?searchTerm=${search}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const autoSearchPm = async (search: string) => {
    try {
        const res = await api.get(`/pm/auto-search?searchTerm=${search}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const getProjectById  = async (projectId : string) => {
    try {
        const res = await api.get(`/project/${projectId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const approveProject = async (projectId  : string) => {
    try {
        const res = await api.patch(`/project/active/${projectId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const getProjectDetail = async (projectId : string) => {
    try {
        const res = await api.get(`/project/${projectId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const getProjectByCustomerId = async (cId: string, queryParams?: string) => {
    try {
        const url = queryParams ? `/project/customer/${cId}?${queryParams}` : `/project/customer/${cId}`;
        const response = await api.get(url);
        return response.data;
    } catch (error: any) {
        return error.message;
    }
}

export const getProjectByCustomerRequest = async (cId : string) => {
    try {
        const res = await api.get(`/project/request/${cId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const addDocumentToProject = async (projectId : string, documentId : string) =>{
    try {
        const res = await api.patch(`/project/add-document/${projectId}`, {dId : documentId} );
        return res.data;
    } catch (error : any) {
        throw error;
    }
}

export const endingProject = async (projectId : string) =>{
     try {
        const res = await api.patch(`/project/ending/${projectId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const projectStatisticById = async (projectId : string) => {
    try {
        const res = await api.get(`/project/statistic/${projectId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const projectStatistic = async () => {
    try {
        const res = await api.get('/project/statistic');
        return res.data;
    } catch (error : any) {
        throw new Error(error?.res?.data?.message)
    }
}

