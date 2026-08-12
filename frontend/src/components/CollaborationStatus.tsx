import { ConnectionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CollaborationStatus ({status} : {status: ConnectionStatus}){
    const colorMap: Record<ConnectionStatus, string> = {
        connecting: 'bg-yellow-500',
        connected: 'bg-green-500',
        disconnected: 'bg-gray-400',
        error: 'bg-red-500',
    };

    const labelMap: Record<ConnectionStatus, string> = {
        connecting: 'Connecting...',
        connected: 'Connected',
        disconnected: 'Disconnected',
        error: 'Error',
    };

    return(<div className="flex items-center gap-2">
        <span className={cn('h-3 w-3 rounded-full', colorMap[status])} />
        <span className="text-sm text-gray-600">{labelMap[status]}</span>
    </div>)



}
