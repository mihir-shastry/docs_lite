//Generates a unique ID for a user
export function generateId() : string{
    return crypto.randomUUID();
}

//Class name combiner
export function cn(...classes: (string | undefined | false)[]) : string{
    return classes.filter(Boolean).join(' ');
}
