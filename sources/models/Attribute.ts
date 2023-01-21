export class Attribute {

    public name: string;
    public description: string;
    public level: string | undefined
    public isOpen: boolean = false;


    constructor(name: string, description: string, level?: string) {
        this.name = name;
        this.description = description;
        this.level = level;
    }

    open() {
        this.isOpen = true;
    }
}
