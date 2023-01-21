import dateMath from "date-arithmetic"

import {Player} from "./Player.js";
import {getRandomValueFromArray} from "../utils/Utils.js";
import {GameService} from "../services/GameService.js";

export class Game {

    public gameId: string;
    public admin: Player;
    public status: "waiting" | "started" | "voting" | "finished";
    public players: Array<Player>;
    public currentMove: {
        player: Player,
        startMove: Date,
        endMove: Date,
        haveSeconds: number
    } | undefined
    public timeToMove: number | undefined;
    public freeSpace: number | undefined;
    public description: {
        bunker: string | undefined;
        cataclysm: string | undefined;
    } | undefined

    constructor(id: string, admin: Player, timeToMove?: number, freeSpace?: number) {
        this.gameId = id;
        this.admin = admin;
        this.players = new Array<Player>();
        this.status = "waiting";
        this.timeToMove = timeToMove;
        this.freeSpace = freeSpace;
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public start(): void {
        if (!this.timeToMove)
            this.timeToMove = 60;
        if (!this.freeSpace) {
            this.freeSpace = Math.ceil(this.players.length / 2)
        }
        for (const player of this.players) {
            player.generateAttributes();
        }
        this.status = "started";
        this.description = {
            bunker: getRandomValueFromArray(listOfBunkerDescriptions.bunker),
            cataclysm: getRandomValueFromArray(listOfBunkerDescriptions.cataclysm)
        }
        const now = new Date();
        this.currentMove = {
            player: this.players[0],
            startMove: now,
            endMove: dateMath.add(now, this.timeToMove, "seconds"),
            haveSeconds: this.timeToMove
        }
    }

    public changeTurn() {
        if (!this.currentMove)
            return
        const currentMovePlayer = this.currentMove.player;
        const playersInGame = this.players.filter(({outOfGame}) => !outOfGame)
        const currentMovePlayerIndex = playersInGame.indexOf(currentMovePlayer);
        if (currentMovePlayerIndex === playersInGame.length - 1)
            GameService.startVoting(this);
        const nextMovePlayerIndex = (currentMovePlayerIndex + 1) % playersInGame.length;
        const now = new Date();
        this.currentMove = {
            player: this.players.at(nextMovePlayerIndex) ?? currentMovePlayer,
            startMove: now,
            endMove: dateMath.add(now, this.timeToMove ?? 60, "seconds"),
            haveSeconds: this.timeToMove ?? 60
        }
    }
}

// type PlayerWithUserName = {
//     name: string,
//     userId: string;
//     gameId: string;
//     outOfGame: boolean;
//     attributes: Array<Attribute> | undefined;
// }

export type gameState = {
    gameId: string;
    admin: Player;
    status: "waiting" | "started" | "voting" | "finished";
    players: Array<Player>;
    currentMove: {
        player: Player,
        startMove: Date,
        endMove: Date,
        haveSeconds: number
    } | undefined
    timeToMove: number | undefined;
    freeSpace: number | undefined;
    description: {
        bunker: string | undefined;
        cataclysm: string | undefined;
    } | undefined
    you: Player
}

const listOfBunkerDescriptions = {
    bunker: ["Был построен 20 лет назад. Имеется плесень и мох, находится в заповеднике, у всех выживших общая комната",
        "Был построен 8 лет назад, Находится под госпиталем, у всех выживших индивидуальные комнаты",
        "Построен в спешке, когда началась эта катастрофа. Не достроен санузел, находится около кладбища, все спальни на 2 человека",
        "Был построен 7 лет назад. Имеется затхлый запах, находится недалеко от электростанции, у всех выживших общая комната",
        "Был построен давно. Внутри отсутствуют двери, находится возле реки, у всех выживших индивидуальные комнаты"],
    cataclysm: ["Сильные ливни спровоцировали прорыв огромного количества дамб по всему миру. Это привело к затоплениям больших территорий суши, в результате чего был нарушен экологический баланс. Ливни не прекращаются. Почва, животный мир, растения, города — всё ушло под воду. Если мы в ближайшее время не займем бункер — окажемся тоже под водой. Еды, чистой воды, животных, вещей — практически не осталось. Находиться на поверхности земли означает верную гибель. На сборы в бункер - 2 часа. Если не успеете - вас затопит. Время пошло. Остаток населения - ≈24 855 340 человек",
        "Многие годы ученые всего мира боролись с глобальным потеплением. Но их методы не спасли от ужасной катастрофы… Из-за увеличенной активности солнца лед на северном полюсе тает с большей скоростью, чем предполагалось. Ледников еще много, но поселения уже уходят под воду. На земле начали вымирать животные и растения, появились новые штаммы неизлечимых смертоносных вирусов. Они убивают людей миллионами. Каждый час Земля все больше уходит под воду, времени все меньше. Остаток населения - ≈59 000 308 человек",
        "Вблизи галактики “Млечный путь” взорвалась сверхновая. Вследствие этого образовались гамма-всплески. Узкие пучки очень жесткого излучения коллапсирующей звезды направлены прямо на планету Земля. Совсем скоро гамма-всплески уничтожат озоновый слой атмосферы родной планеты и вся поверхность будет выжжена. Все живое на Земле моментально погибнет, вся вода испарится, температура вырастет до невыносимых для человека показателей, планета превратится в обугленный шар. Выжить будет возможно только глубоко под землей… Остаток населения - ≈17 136 766 человек",
        "На нашей планете осталось не так много мест, которые хранят в себе тайны. Очень долгое время человечество изучало мировой океан. Неудивительно, что в давние времена ходило множество легенд о морских монстрах, и сейчас случилось то, чего никто не ожидал! Из глубин океанов в огромном количестве поднимаются разные чудовища, которые беспощадно убивают людей также, как и люди разрушали океаны многие года... Монстров так много, что убить всех невозможно. Народ понял, что на протяжении долгих лет причиняли вред океану и сейчас катаклизм никаким образом не остановить. Самые безопасные места - те, которые находятся дальше от воды. Человечеству нужно лишь переждать наступление чудовищ, чтобы снова вернуться к нормальной жизни, но уже с уважением к мировому океану. Остаток населения - ≈47 155 314 человек",
        "Всю свою историю человечество боялось восстания искусственного интеллекта против населения планеты. Опасения оказались не напрасны. Суперкомпьютер пошел против человека. Судный день уже начался. Для порабощения человечества искусственный интеллект использует беспилотную технику. Суперкомпьютер уязвим к DDoS-атакам. Лишь лучшие хакеры планеты смогут противостоять ему. Выходить из бункера опасно, роботы обладают сенсорами и могут легко засечь любое движение... Остаток населения - ≈42 845 607 человек"
    ]
}