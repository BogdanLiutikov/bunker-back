export function getRandomValueFromArray(array: any[]): any {
    return array[Math.floor(Math.random() * array.length)];
}

function S4(): string {
    return (24 + Math.random() * 1024 | 0).toString(16);
}

// then to call it, plus stitch in '4' in the third group
export const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substring(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();