import api from '../../../common/configs/apis/axios.config';
import type {IPhase} from '../interfaces/project.interface';


export const getPhaseByProjectId = async (projectId : string ) => {
    try {
        const res = await api.get(`/phase/project-phase/${projectId}`);
        return res.data;    
    } catch ( error : any) {
        return error.message;
    }
}

export const createPhase = async (phaseData : IPhase) => {
    try {
        const res = await api.post(`/phase` , phaseData);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
} 

export const updatePhaseById  = async (phaseId : string , phaseData : IPhase ) => {
    try {
        const res = await api.put(`/phase/${phaseId}`, phaseData);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

export const deletePhaseById = async (phaseId : string) => {
    try {
        const res = await api.delete(`/phase/${phaseId}`);
        return res.data;
    } catch (error : any) {
        return error.message;
    }
}

