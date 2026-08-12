export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null;

    return(...args: Parameters<T>) => {
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn(...args);
        }, delay)
    }
}

export function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? 'ERROR' : level === 'warn' ? 'Caution' : "Info";
    console.log(`[${timestamp}] ${prefix} ${message}`);

}