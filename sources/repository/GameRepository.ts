import {Game} from "../models/Game.js";
import {PlayerRepository} from "./PlayerRepository.js";

export class GameRepository {
    public static games: Array<Game> = [];

    public static addGame(game: Game) {
        this.games.push(game);
    }

    public static getGameById(gameId: string): Game | undefined {
        return this.games.find(({gameId: id}) => id === gameId);
    }

    public static allGamesByGameIds(gameIds: string[]): Game[] {
        return this.games.filter(({gameId}) => gameIds.includes(gameId))
    }

    public static allGamesByUserId(userId: string): Game[] {
        const players = PlayerRepository.allPlayersByUserId(userId);
        const gameIds = players.map(({gameId}) => gameId);
        return this.allGamesByGameIds(gameIds);
    }
}