import api from '../../../common/configs/apis/axios.config';

export const getFeedbackInProject = async (projectId: string) => {
    try {
        const res = api.get(`/feedback/project/${projectId}`);
        return (await res).data;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const addFeedback = async (feedback: any) => {
    try {
        const res = await api.post(`/feedback`, feedback);
        return res.data;
    } catch (error: any) {
        throw new Error(error.message)
    }
}