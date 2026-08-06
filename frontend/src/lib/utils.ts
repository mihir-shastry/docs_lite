//Generates a unique ID for a user
export function generateId() : string{
    return crypto.randomUUID();
}

//Assigns a user a color for edit identification purposes
export function pickColor() : string{
    const colors = ['#FF6B6B', '#e18700', '#45B7D1', '#96CEB4', '#FFEAA7', '#b70ab7'];
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
}

//Class name combiner
export function cn(...classes: (string | undefined | false)[]) : string{
    return classes.filter(Boolean).join(' ');
}
