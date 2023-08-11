export interface IMessage {
    uid?: string;
    displayName?: string;
    photoURL?: string;
    text?: string;
    createdAt?: any;
    docId?:string
    isPinned?:boolean
    imageURL?:string | null
    repliedMessage?:any
}

export interface IRoom {
    name?: string;
    status?: string;
    docId?:string;
    timestamp?:any;
    users?: Array<any>;
}
export interface IUser {
    name?: string;
    uid?: string;
    createdAt:any;
}