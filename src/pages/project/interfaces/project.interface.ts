export interface IProject {
    _id : string ,
    alias : string,
    name : string,
    pm : {
        _id : string,
        name : string,
        emailContact : string
    },
    customer : {
        _id : string,
        name : string,
        emailContact: string
    },
    status : string,
    day : Date,
    isActive : boolean
    documentIds : any
}

export interface IDocument {
   _id?: string;
   name : string,
   day: Date,
   files : Array<IFile>,
   sender : string
}

export interface IFile {
    originalName : string,
    path: string,
    size: number ,
    type : string
}
