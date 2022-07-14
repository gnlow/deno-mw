import { Bot } from "../mod.ts"
import secrets from "../secrets.json" assert { type: "json" }

const testBot = new Bot({
    apiUrl: "http://wiki.shtelo.org/api.php",
    username: secrets.username,
    password: secrets.password,
    userAgent: "TadiaBot/0.1.0 (https://github.com/Yirule/Tadia)"
})

console.log(await testBot.login())
console.log(await testBot.csrfToken)
/*
console.log(await testBot.edit({
    title: "연습장:Gnlow/API",
    text: "TESTTTT"
}))
*/