export interface IUser {
    _id: string,
    email : string,
    alias : string,
    isActive : boolean,
    createAt: string,
    updatedAT: string
}

export interface IUserStatistic {
     totalUsers: number,
     totalActive: number,
     percentActive: number,
     totalCustomer: number,
     totalPM : number,
     percentCustomer: number,
     percentPM : number
}