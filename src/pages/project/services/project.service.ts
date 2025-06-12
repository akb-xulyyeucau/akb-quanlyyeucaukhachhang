import api from '../../../common/configs/apis/axios.config';
import type { IProject } from '../interfaces/project.interface';

export const getAllProject = async () => {
    try {
        const res = await api.get('/project');
        return res.data;
    } catch (error : any) {
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