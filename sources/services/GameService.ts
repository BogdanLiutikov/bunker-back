import {guid} from "../utils/Utils.js";
import {GameRepository} from "../repository/GameRepository.js";
import {Game} from "../models/Game.js";
import {UserRepository} from "../repository/UserRepository.js";
import {Player} from "../models/Player.js";
import {PlayerRepository} from "../repository/PlayerRepository.js";

export class GameService {


    public createGame(userId: string | undefined, timeToMove?: number, freeSpace?: number): string {
        const gameId = guid();
        if (!userId)
            throw new Error("Вы не авторизованы")
        const user = UserRepository.getUserByUserId(userId);
        if (!user)
            throw new Error("Такого пользователя не существует. Попробуйте залогиниться заново")

        const player = new Player(userId, gameId);
        PlayerRepository.addPlayer(player)
        const game = new Game(gameId, player, timeToMove, freeSpace);
        game.addPlayer(player)
        GameRepository.addGame(game)
        return gameId
    }

    addUserToGame(userId: string, game: Game): Player {
        if (PlayerRepository.getPlayerByUserIdAndGameId(userId, game.gameId))
            throw new Error("Вы пытаетесь подключиться к этой игре повторно")
        const player = new Player(userId, game.gameId)
        PlayerRepository.addPlayer(player)
        game.addPlayer(player);
        return player;
    }

    static startGame(gameId: string) {
        const game = GameRepository.getGameById(gameId);
        if (!game)
            throw new Error("Не существующая игра")
        if (game.status !== "waiting")
            throw new Error("Игра уже была начата")
        GameRepository.getGameById(gameId)?.start()
    }

    static startVoting(game: Game) {
        game.status = "voting";
    }
}