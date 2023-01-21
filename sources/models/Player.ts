import {Attribute} from "./Attribute.js";
import {getRandomValueFromArray} from "../utils/Utils.js";
import {UserRepository} from "../repository/UserRepository.js";

export class Player {

    public userId: string;
    public gameId: string;
    public outOfGame: boolean = false;
    public attributes: Array<Attribute> | undefined;
    public userName: string | undefined

    constructor(userId: string, gameId: string) {
        this.userId = userId;
        this.gameId = gameId;
        this.attributes = new Array<Attribute>();
        this.userName = UserRepository.getUserByUserId(userId)?.name;
    }

    public toJSON() {
        return {
            userName: this.userName,
            gameId: this.gameId,
            outOfGame: this.outOfGame,
            attributes: this.attributes
        }
    }

    public generateAttributes() {
        for (const {name, descriptions} of Object.values(listOfPlayerAttributes)) {
            this.attributes?.push(new Attribute(name, getRandomValueFromArray(descriptions)))
        }
        const pr = this.attributes?.find(({name}) => name === "Профессия")
        if (pr)
            pr.level = getRandomValueFromArray(listOfPlayerAttributes.profession.level)
    }

}

type PlayerAttribute = {
    name: string,
    descriptions: string[],
    level?: string
}

export const listOfPlayerAttributes = {
    sex: {
        name: "Пол",
        descriptions: ["мужчина", "женщина"]
    },
    age: {
        name: "Возраст",
        descriptions: ["Молодой", "Взрослый", "Старый"]
    },
    profession: {
        name: "Профессия",
        descriptions: ["Геймер", "Гейм-дизайнер", "Дизайнер", "Программист", "Преподаватель", "Водитель автобуса", "Лётчик", "Продавец", "Инженер"],
        level: ["Дилетант", "Стажер", "Новичок", "Любитель", "Опытный", "Эксперт", "Профессионал"]
    },
    physique: {
        name: "Телосложение",
        descriptions: ["худое", "полное", "атлетичное"]
    },
    trait: {
        name: "Черта характера",
        descriptions: ["жизнерадостность", "дисциплинированность", "сообразительность", "отзывчивость", "наивность"]
    }
}