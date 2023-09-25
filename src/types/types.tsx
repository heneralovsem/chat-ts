export interface IMessage {
    uid?: string;
    displayName?: string;
    photoURL?: string;
    text?: string;
    createdAt?: any;
    docId?:string
    isPinned?:boolean
    imageURL?:string | null
    repliedMessage?:IRepliedMessage
    eventMessage?:boolean
}

export interface IRoom {
    name?: string;
    status?: string;
    docId?:string;
    timestamp?:any;
    users?: Array<any>;
}


export interface IRepliedMessage {
    avatar?: string;
    displayName?:string;
    text?:string;
    id?:string;
}