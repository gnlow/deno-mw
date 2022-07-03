import type { ApiLoginParams } from "https://cdn.skypack.dev/types-mediawiki/api_params?dts"

import urlcat, { ParamMap } from "https://deno.land/x/urlcat/src/index.ts"

import {
  Cookie,
  CookieJar,
  wrapFetch,
} from "https://deno.land/x/another_cookiejar@v4.1.4/mod.ts"

interface BotOptions {
    apiUrl: string
    username: string
    password: string
}

export class Bot {
    apiUrl
    username
    password

    cookieJar = new CookieJar()
    fetch = wrapFetch({cookieJar: this.cookieJar})

    constructor(options: BotOptions) {
        this.apiUrl = options.apiUrl
        this.username = options.username
        this.password = options.password
    }
    
    async GET(params: ParamMap) {
        return await this.fetch(
            urlcat(this.apiUrl, params)
        )
    }
    async POST(params: ParamMap) {
        return await this.fetch(
            this.apiUrl,
            {
                method: "POST",
                body: JSON.stringify(params),
            }
        )
    }

    async login() {
        const loginToken = await this.GET({
            action: "query",
            meta: "tokens",
            type: "login",
            format: "json",
        })
        .then(res => res.json())
        .then(res => res.query.tokens.logintoken)

        return await this.POST({
            action: "login",
            lgname: this.username,
            lgpassword: this.password,
            lgtoken: loginToken,
            format: "json",
        })
        .then(res => res.body)
    }
}