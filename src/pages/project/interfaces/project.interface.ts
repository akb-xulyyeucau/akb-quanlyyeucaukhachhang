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
