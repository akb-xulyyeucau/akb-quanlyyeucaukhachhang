export interface IProject {
    _id : string ,
    alias : string,
    name : string,
    pm : {
        _id : string,
        name : string,
        emailContact : string,
        phoneContact : string
    },
    customer : {
        _id : string,
        name : string,
        emailContact: string,
        phoneContact : string
    },
    status : string,
    day : Date,
    isActive : boolean
    documentIds : any
}

export interface IDocument {
    _id?: string;
    name: string;
    day: Date | string;
    files: IFile[];
    sender: {
        _id: string;
        email: string;
        role: string;
        alias: string;
    };
    isTrash: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IFile {
    _id?: string;
    originalName: string;
    path: string;
    size: number;
    type: string;
}

export interface IPhase {
    _id?: string,
    projectId: string,
    name : string, 
    phases : Array<IPhaseItem>
    currentPhase : number
}
export interface IPhaseItem {
    name: string,
    order: number,
    description: string,
    day : Date
}

export interface IReportTable {
    _id : string,
    projectId: string,
    mainContent: string,
    sender : string,
    day: Date,
}

