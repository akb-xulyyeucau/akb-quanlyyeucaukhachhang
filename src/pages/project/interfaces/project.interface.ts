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

export interface IReport {
    _id : string ,
    projectId : {
        _id: string,
        name: string,
        alias: string
    },
    mainContent : string,
    sender : {
        _id: string;
        email: string;
        role: string;
        alias: string;
    },
    day : Date | string,
    subContent : Array<ISubContent>,
    createdAt : Date | string,
    updatedAt : Date | string,
    __v?: number
}

export interface ISubContent {
    _id?: string,
    contentName: string,
    files?: Array<IFile>,
    fileIndices?: number[]
}

export interface IPayloadReport {
    projectId : string,
    mainContent : string,
    sender : string,
    day : Date | string,
    subContent : Array<ISubContent>,
}

export interface IFeedback {
  _id: string;
  customerId?: {
    name?: string;
    [key: string]: any;
  };
  rating?: number;
  comment?: string;
  suggest?: string;
  [key: string]: any;
  createdAt : Date;
};

export interface IProjectStatistic {
  projectName: string;
  startDate: Date | string;
  estimateDate: Date | string;
  pm: {
    _id: string;
    alias: string;
    name: string;
    emailContact: string;
  };
  customer: {
    _id: string;
    alias: string;
    name: string;
    emailContact: string;
  };
  daysInProgress: number;
  pmReportCount: number;
  customerReportCount: number;
  pieChart: {
    currentPhase: number;
    phaseNum: number;
  };
  chart: {
    weekLabels: string[];
    pmReportByWeek: number[];
    customerReportByWeek: number[];
  };
}