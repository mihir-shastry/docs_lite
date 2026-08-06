//Data about a document.
export interface DocMeta{
    id : string;
    title : string;
    createdAt : number;
    updatedAt : number
}
//Data about an editor.
export interface UserInfo{
    name: string;
    color: string
}
//Status about a user's connection.
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'