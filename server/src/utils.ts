export function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? 'ERROR' : level === 'warn' ? 'Caution' : "Info";
    console.log(`[${timestamp}] ${prefix} ${message}`);

}
