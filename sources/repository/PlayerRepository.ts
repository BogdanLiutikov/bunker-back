import {Player} from "../models/Player.js";


export class PlayerRepository {
    public static players = new Array<Player>();

    public static addPlayer(player: Player) {
        this.players.push(player);
    }

    public static allPlayersByUserId(userId: string): Player[] {
        return this.players.filter((player) => player.userId === userId)
    }

    public static getPlayerByUserIdAndGameId(userId: string, gameId: string): Player | undefined {
        return this.players.find((player) => player.userId === userId && player.gameId === gameId)
    }
}