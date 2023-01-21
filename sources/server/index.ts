import Express, {Request} from 'express';
import session from "express-session";
import {Data, WebSocketServer} from 'ws';
import {createServer} from 'http';
import cookieParser from "cookie-parser";
import clone from "just-clone";
import dateMath from "date-arithmetic"


import {GameRepository} from "../repository/GameRepository.js";
import type {gameState} from "../models/Game.js";
import {Attribute} from "../models/Attribute.js";
import {UserService} from "../services/UserService.js";
import {GameService} from "../services/GameService.js";
import {PlayerService} from "../services/PlayerService.js";
import {UserRepository} from "../repository/UserRepository.js";
import {PlayerRepository} from "../repository/PlayerRepository.js";

const port = 8080;

const app = Express();


app.use(Express.json())
app.use(cookieParser())

declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false,
});

app.use(sessionParser)

const httpServer = createServer(app);

const wss = new WebSocketServer({
    clientTracking: false,
    noServer: true,
}, () => {
    console.log(`WebSocket is listening on port ${port}`)
})

const userService = new UserService()
const gameService = new GameService()
const playerService = new PlayerService()

app.use((req, res, next) => {
    // res.status(200);
    // console.log(`${req.method} запрос на ${req.url}`);
    res.append('Access-Control-Allow-Origin', "http://localhost:3000")
        .append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        .append('Access-Control-Allow-Headers', 'Content-Type')
        .append("Access-Control-Allow-Credentials", "true")
    next();
});

app.get('/', (req, res) => {
    console.log('Пришел запрос на /')
    res.status(200);
    // res.setHeader("Content-Type", "application/json");
    // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
    // res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, POST, DELETE, OPTIONS")
    const response = {
        "message": "Hello World!"
    }
    res.send(JSON.stringify(response))
    res.end();
})

app.post('/login', (req, res) => {
    console.log("Пришел POST на /login")
    if (req.body.method !== "login") return

    const token = userService.registeringUser(req.body.name)

    res
        .status(200)
        .send(JSON.stringify({
            method: "login",
            token: token,
        }))
        .end();
})

app.post("/newGame", (req, res) => {
    console.log("Пришел POST на /newGame")
    if (req.body.method !== "createGame") return;
    const userId = req.cookies.token;
    const {freeSpace, timeToMove}: { method: string, freeSpace: number, timeToMove: number } = req.body;
    let gameId
    try {
        gameId = gameService.createGame(userId, timeToMove, freeSpace);
    } catch (e) {
        console.log((e as Error).message)
        res.status(401)
            .send(JSON.stringify({
                method: "createGame",
                error: (e as Error).message
            }))
            .end()
        return;
    }
    res.send(JSON.stringify({
        method: "createGame",
        gameId: gameId
    })).end()
})

app.post("/joinGame", (req, res) => {
    console.log("Пришел POST на /joinGame")

    if (req.body.method !== "joinGame") return;

    const userId = req.cookies.token;
    if (!userId) {
        res.status(401).send(JSON.stringify({method: "joinGame", error: "Вы не авторизованы"})).end()
        return;
    }

    const gameId = req.body.gameId;
    if (!gameId) {
        res.status(400).send(JSON.stringify({method: "joinGame", error: "Не передана ссылка на игру"})).end()
        return;
    }

    const game = GameRepository.getGameById(gameId);
    if (!game) {
        res.status(401)
            .send(JSON.stringify({
                method: "joinGame",
                error: "Несуществующая игра"
            })).end()
        return;
    }

    let player;
    try {
        player = gameService.addUserToGame(userId, game);
    } catch (e) {
        console.log((e as Error).message)
        res.status(400)
            .send(JSON.stringify({
                method: "joinGame",
                error: (e as Error).message
            })).end()
        return;
    }

    const games = GameRepository.allGamesByUserId(userId);
    res.send(JSON.stringify({
        method: "joinGame",
        games: games
    })).end()
})


httpServer.listen(port, () => {
    console.log(`HTTP is listening on port ${port}`)
})


httpServer.on("upgrade", (request: Request, socket, head) => {
    console.log("Client want to upgrade socket to WebSocket")

    wss.handleUpgrade(request, socket, head, (ws) => {
        ws.on('connection', () => {

            console.log("client connected")
            ws.on('message', (message: Data) => {

                const content = JSON.parse(message as string);
                let user, game, payLoad;

                if (content.userId)
                    user = UserRepository.getUserByUserId(content.userId);
                if (content.gameId)
                    game = GameRepository.getGameById(content.gameId);

                switch (content.method) {
                    case "IWasHereBefore":
                        const userId = content.userId
                        if (!userId)
                            return;
                        if (!user)
                            return;
                        user.ws = ws;
                        payLoad = {
                            method: "IWasHereBefore",
                            message: "Yes, WS reconnected"
                        };
                        ws.send(JSON.stringify(payLoad))
                        break;
                    case "myGames":
                        payLoad = myGamesMessage(content.userId)
                        ws.send(JSON.stringify(payLoad))
                        break;
                    case "updateGameState":
                        if (!game)
                            return
                        for (const player of game.players) {
                            payLoad = updateGameState(player.userId, content.gameId);
                            const ws = UserRepository.getUserByUserId(player.userId)?.ws
                            if (ws) {
                                ws.send(JSON.stringify(payLoad))
                            }
                        }
                        break;
                    case "openAttribute":
                        payLoad = openAttribute(content.userId, content.gameId, content.attribute);
                        ws.send(JSON.stringify(payLoad))
                        break;
                    case "startGame":
                        try {
                            GameService.startGame(content.gameId);
                        } catch (e) {
                            ws.send(JSON.stringify({
                                method: "startGame",
                                error: (e as Error).message
                            }))
                        }
                        payLoad = startGame();
                        ws.send(JSON.stringify(payLoad))
                        break;
                    case "vote":
                        break;
                    case "joinGame":
                        if (!game) return;
                        const players = game.players;
                        for (const player of players) {
                            const ws = UserRepository.getUserByUserId(player.userId)?.ws;
                        }
                        break;
                    default:
                        payLoad = defaultMessage()
                        ws.send(JSON.stringify(payLoad))
                        break;
                }
            });
        })

        ws.emit('connection', ws, request);
    })
})

function startGame() {
    return {
        method: "startGame",
        message: "Game started"
    }
}

function openAttribute(userId: string, gameId: string, attribute: string) {
    const player = PlayerRepository.getPlayerByUserIdAndGameId(userId, gameId);
    const game = GameRepository.getGameById(gameId);
    let message = undefined;
    let error = undefined

    if (!player) {
        console.log("Player не найден")
        error = "Player не найден";
        return
    }
    if (!game) {
        console.log("Game не найдена")
        error = "Game не найдена";
        return

    }

    if (game.currentMove?.player !== player) {
        return {
            method: "openAttribute",
            error: "Сейчас не ваш ход"
        }
    }

    const attr = player.attributes?.find(({name}) => name === attribute)
    if (attr?.isOpen) {
        message = "Атрибут уже открыт";
    } else {
        attr?.open();
        game.changeTurn();
    }

    message = "Атрибут открыт, ход перешел к следующему игроку";

    return {
        method: "openAttribute",
        message: message,
        error: error
    }
}


function updateGameState(userId: string, gameId: string) {
    const player = PlayerRepository.getPlayerByUserIdAndGameId(userId, gameId);
    const game = GameRepository.getGameById(gameId);
    if (!player) {
        console.log("Player не найден")
        return
    }
    if (!game) {
        console.log("Game не найдена")
        return
    }

    const clonePlayers = clone(game.players)

    let currentMove = undefined;
    if (game.currentMove) {
        const now = new Date()
        currentMove = {
            player: game.currentMove.player,
            startMove: game.currentMove.startMove,
            endMove: game.currentMove.endMove,
            haveSeconds: dateMath.diff(now, game.currentMove.endMove, "seconds")
        }
    }

    const gs: gameState = {
        gameId: game.gameId,
        admin: game.admin,
        status: game.status,
        currentMove: currentMove,
        freeSpace: game.freeSpace,
        timeToMove: game.timeToMove,
        description: game.description,
        players: clonePlayers.map((player) => {
            if (player.userId !== userId) {
                player.attributes = player.attributes?.map((attribute: Attribute) => {
                    if (attribute.isOpen)
                        return attribute;
                    else {
                        attribute.description = "";
                        return attribute;
                    }
                })
            }
            return player;
        }),
        you: player
    }

    return {
        method: "updateGameState",
        gameState: gs
    }
}

function defaultMessage() {
    return {
        message: "default message"
    }
}

function myGamesMessage(userId: string) {
    const gs = GameRepository.allGamesByUserId(userId);
    return {
        method: "myGames",
        games: gs,
    }
}

