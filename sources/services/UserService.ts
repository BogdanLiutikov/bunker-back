import {UserRepository} from "../repository/UserRepository.js";
import {User} from "../models/User.js";
import {guid} from "../utils/Utils.js";

export class UserService {

    constructor() {
    }

    public registeringUser(name: string): string {
        const token = guid();
        UserRepository.addUser(new User(name, token));
        return token;
    }
}

