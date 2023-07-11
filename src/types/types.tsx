export interface IMessage {
    uid?: string;
    displayName?: string;
    photoURL?: string;
    text?: string;
    createdAt?: any;
}

export interface IRoom {
    name?: string;
    createdAt?:any;
}