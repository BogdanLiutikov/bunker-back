import {User} from "../models/User.js";
import {WebSocket} from "ws";

export class UserRepository {

    //todo а можно не на массивах
    public static users: Array<User> = [];
    public static usersW = new WeakMap<WebSocket, User>();

    public static getUserByUserId(userId: string): User | undefined {
        return this.users.find(({userId: uId}) => uId === userId)
    }

    public static getUserByName(name: string): User | undefined {
        return this.users.find(({name: n}) => n === name);
    }

    //todo а можно не по имени
    public static addUser(user: User): boolean {
        if (this.getUserByName(user.name))
            return false;
        this.users.push(user);
        // usersW.set(user.userId, user);
        return true;
    }

    public static addUserWS(user: User, ws: WebSocket): boolean {
        if (this.getUserByName(user.name))
            return false;
        this.users.push(user);
        this.usersW.set(ws, user);
        return true;
    }


    public static allUsersByIds(userIds: string[]): User[] {
        return this.users.filter(({userId: id}) => userIds.includes(id))
    }
}