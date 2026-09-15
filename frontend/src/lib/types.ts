//Data about an editor.
export interface UserInfo{
    name: string;
    color: string
}

//A document recently opened in this browser.
export interface RecentDocument {
    id: string;
    title: string;
    updatedAt: number;
}
//Status about a user's connection.
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

//An online user's presence, derived from Yjs awareness.
export interface OnlineUser {
    clientId: number;
    userInfo: UserInfo;
}
