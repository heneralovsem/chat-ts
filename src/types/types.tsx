export interface IMessage {
    uid?: string;
    displayName?: string;
    photoURL?: string;
    text?: string;
    createdAt?: any;
    docId?:string
}

export interface IRoom {
    name?: string;
    status?: string;
    timestamp?:any;
    users?: Array<any>;
}
export interface IUser {
    name?: string;
    uid?: string;
    createdAt:any;
}