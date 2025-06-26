export interface ICustomer {
    _id : string,
    alias: string,
    userId: any,
    name: string,
    emailContact: string,
    phoneContact: string,
    companyName: string,
    dob: Date,
    address: string,
    note: string
}

export interface ICustomerStatisticResponse {
  totalCustomerInProject: number;
  totalCustomer: number;
  percentProjectWithCustomer: number;
  customersWithProjects: CustomerWithProjects[];
}

export interface CustomerWithProjects {
  customerId: string;
  customerName: string;
  customerAlias: string;
  emailContact: string;
  projectCount: number;
  projects: ProjectSummary[];
  percentProject : number
}

export interface ProjectSummary {
  _id: string;
  name: string;
  alias: string;
  status: string;
}