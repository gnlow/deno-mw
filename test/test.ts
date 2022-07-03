import { Bot } from "../mod.ts"
import secrets, { username, password } from "../secrets.json" assert { type: "json" }

const testBot = new Bot({
    apiUrl: "http://wiki.shtelo.org/api.php",
    username: secrets.username,
    password: secrets.password,
})

console.log(await testBot.login())