import {User} from "../models/User.js";

export class UserRepository {

    public static users: Array<User> = [];

    public static getUserByUserId(userId: string): User | undefined {
        return this.users.find(({userId: uId}) => uId === userId)
    }

    public static getUserByName(name: string): User | undefined {
        return this.users.find(({name: n}) => n === name);
    }


    public static addUser(user: User): boolean {
        if (this.getUserByUserId(user.userId))
            return false;
        this.users.push(user);
        return true;
    }


    public static allUsersByIds(userIds: string[]): User[] {
        return this.users.filter(({userId: id}) => userIds.includes(id))
    }
}