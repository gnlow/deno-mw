import { Lw } from "https://denopkg.com/gnlow/lazywrap@main/mod.ts"

import urlcat, { ParamMap } from "https://deno.land/x/urlcat/src/index.ts"

import type * as T from "https://cdn.skypack.dev/types-mediawiki/api_params?dts"

import {
  CookieJar,
  wrapFetch,
} from "https://deno.land/x/another_cookiejar@v4.1.4/mod.ts"

interface BotOptions {
    apiUrl: string
    username: string
    password: string
    userAgent: string
}

export class Bot {
    apiUrl
    username
    password
    userAgent

    cookieJar = new CookieJar()
    fetch = wrapFetch({cookieJar: this.cookieJar})

    @Lw("getLoginToken")
    declare loginToken: Lw<string>

    @Lw("getCsrfToken")
    declare csrfToken: Lw<string>


    constructor(options: BotOptions) {
        this.apiUrl = options.apiUrl
        this.username = options.username
        this.password = options.password
        this.userAgent = `${options.userAgent} deno-mw/0.1.0`
    }
    
    async GET(params: ParamMap) {
        return await this.fetch(
            urlcat(this.apiUrl, {
                ...params,
                format: "json"
            }),
            {
                headers: {
                    "user-agent": this.userAgent,
                }
            }
        )
    }
    async POST(params: ParamMap) {
        const {
            action,
            ...rest
        } = params
        return await this.fetch(
            urlcat(this.apiUrl, {action, format: "json"}),
            {
                method: "POST",
                body: urlcat("", rest),
                headers: {
                    "user-agent": this.userAgent,
                    "content-type": "application/x-www-form-urlencoded",
                }
            }
        )
    }
    async POST_multipart(params: ParamMap) {
        const {
            action,
            ...rest
        } = params
        const formData = new FormData()
        Object.entries(rest).forEach(
            ([name, value]) => formData.append(name, value)
        )
        return await this.fetch(
            urlcat(this.apiUrl, {action, format: "json"}),
            {
                method: "POST",
                body: formData,
                headers: {
                    "user-agent": this.userAgent,
                    //"content-type": "application/x-www-form-urlencoded",
                }
            }
        )
    }

    async getLoginToken() {
        return this.loginToken = await this.GET({
            action: "query",
            meta: "tokens",
            type: "login",
            format: "json",
        })
        .then(res => res.json())
        .then(res => res.query.tokens.logintoken)
    }
    async login() {
        return await this.POST({
            action: "login",
            lgname: this.username,
            lgpassword: this.password,
            lgtoken: await this.loginToken,
        })
        .then(res => res.json())
    }
    async getCsrfToken() {
        return this.csrfToken = await this.GET({
            action: "query",
            meta: "tokens",
        })
        .then(res => res.json())
        .then(res => res.query.tokens.csrftoken)
    }

    async edit(options: T.ApiEditPageParams) {
        return await this.POST({
            action: "edit",
            token: await this.csrfToken,
            ...options
        })
        .then(res => res.json())
    }
    /**
     * ```
     * await testBot.upload({
     *      filename: "file.svg",
     *      file: new Blob([await Deno.readFile("world_opt.svg")]),
     *  })
     * ```
     */
    async upload(options: T.ApiUploadParams) {
        return await this.POST_multipart({
            action: "upload",
            token: await this.csrfToken,
            ...options
        })
        .then(res => res.json())
    }
}