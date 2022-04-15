import express from 'express';
import Handlebars from 'express-handlebars';
import { dirname, join } from 'path';
import { fileURLToPath } from "url";
import Election, { listNomineesInRoom } from '../bot/election.js';
import { HerokuClient } from "../bot/herokuClient.js";
import { fetchChatTranscript, getUsersCurrentlyInTheRoom, isBotInTheRoom } from '../bot/utils.js';
import { dateToUtcTimestamp } from '../bot/utils/dates.js';
import * as helpers from "./helpers.js";
import { routes, start, stop } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viewsPath = join(__dirname, "views");
const staticPath = join(__dirname, 'static');
const partialsPath = join(viewsPath, "partials");
const layoutsPath = join(viewsPath, "layouts");

const app = express().set('port', process.env.PORT || 5000);

/*
 * By default we want to password-protect all routes.
 * Whitelist these public paths from password protection.
 */
const publicPaths = [
    "/", "/ping", "/feedback", "/static", "/favicon.ico"
];

/** @type {Handlebars.ExphbsOptions} */
const handlebarsConfig = {
    // without extname property set to .<extension>, partials will not work
    extname: ".handlebars",
    partialsDir: partialsPath,
    layoutsDir: layoutsPath,
    helpers
};

app
    .engine('handlebars', Handlebars(handlebarsConfig))
    .set("views", viewsPath)
    .set('view engine', 'handlebars')
    .set('view cache', 'false');

/**
 * @typedef {import("../bot/config").BotConfig} BotConfig
 * @typedef {import("express").Application} ExpressApp
 * @typedef {import("chatexchange/dist/Room").default} Room
 * @typedef {import("chatexchange").default} Client
 * @typedef {import("../bot/utils").RoomUser} RoomUser
 * @typedef {import("http").Server} HttpServer
 */

/**
 * @private
 *
 * @summary internal bot config state holder
 * @type {BotConfig | undefined}
 */
let BOT_CONFIG;

/**
 * @private
 *
 * @summary internal ChatExchange client reference
 * @type {Client | undefined}
 */
let BOT_CLIENT;

/**
 * @private
 *
 * @summary internal room reference
 * @type {Room | undefined}
 */
let BOT_ROOM;

/**
 * @private
 *
 * @summary internal election reference
 * @type {Election | undefined}
 */
let ELECTION;

/*
 * Register staticPath hosting static assets
 */
app.use(express.static(staticPath));

/*
 * Use urlencoded() middleware to parse form data
 * See https://stackoverflow.com/a/59892173
 */
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const { query, ip, hostname, path, body = {} } = req;

    // Redirect to hostname specified in bot config
    const scriptHostname = BOT_CONFIG?.scriptHostname;
    if (scriptHostname && !scriptHostname.includes(hostname) && !scriptHostname.includes('localhost')) {
        if (BOT_CONFIG?.debugOrVerbose) console.log(`SERVER - Redirected ${hostname} to ${scriptHostname}`);

        const querystring = req.url.split('?')[1] || null;
        res.redirect(`${scriptHostname}${path}${querystring ? '?' + querystring : ''}`);
        return;
    }

    // Password-protect pages
    const { password: pwdFromQuery = "" } = query;
    const { password: pwdFromBody = "" } = body;

    const password = pwdFromQuery || pwdFromBody;
    const validPwd = password === process.env.PASSWORD;

    if (!publicPaths.includes(path) && !validPwd) {
        console.log(`SERVER - Unauthorised connect "${path}"
            IP:   ${ip}
            Host: ${hostname}
            Pass: ${password}
        `);
        return res.sendStatus(401);
    }

    next();
});


// Routes
app.route('/')
    .get(async (_req, res) => {

        if (!BOT_CONFIG || !ELECTION || !BOT_CLIENT) {
            console.error("SERVER - required config missing\n", BOT_CONFIG, ELECTION, BOT_CLIENT);
            return res.sendStatus(500);
        }

        try {
            const {
                chatDomain,
                chatRoomId,
                shortIdleDurationMins,
                longIdleDurationHours,
                lowActivityCheckMins,
                lastActivityTime,
                lastMessageTime,
            } = BOT_CONFIG;

            const safeBotData = {
                ...JSON.parse(JSON.stringify(BOT_CONFIG)),
                apiKeyPool: []
            };

            const chatProfile = await BOT_CLIENT.getMe();
            const chatDisplayName = await chatProfile.name;

            const isBotInRoom = BOT_ROOM ? await isBotInTheRoom(BOT_CONFIG, BOT_CLIENT, BOT_ROOM) : false;

            /** @type {RoomUser[]} */
            const nomineesInRoom = [];
            if (BOT_ROOM) {
                const users = await getUsersCurrentlyInTheRoom(BOT_CONFIG, BOT_CLIENT.host, BOT_ROOM);
                const nominees = await listNomineesInRoom(BOT_CONFIG, ELECTION, BOT_CLIENT.host, users);
                nomineesInRoom.push(...nominees);
            }

            const { scrapedSiteMods } = ELECTION;

            res.render('index', {
                page: {
                    appName: process.env.HEROKU_APP_NAME,
                    title: "Home"
                },
                heading: `${chatDisplayName} up and running.`,
                data: {
                    isBotInRoom,
                    utcNow: dateToUtcTimestamp(Date.now()),
                    autoRefreshInterval: BOT_CONFIG.scrapeIntervalMins * 60,
                    chatRoomUrl: `https://chat.${chatDomain}/rooms/${chatRoomId}`,
                    siteHostname: ELECTION.siteHostname,
                    election: ELECTION,
                    currentSiteMods: [...ELECTION.currentSiteMods.values()],
                    scrapedSiteMods,
                    nomineesInRoom,
                    botconfig: {
                        // overrides should come after the object spread
                        ...safeBotData,
                        roomBecameIdleAWhileDate: new Date(lastActivityTime + (shortIdleDurationMins * 6e4)),
                        roomBecameIdleHoursDate: new Date(lastActivityTime + (longIdleDurationHours * 60 * 6e4)),
                        botWillBeQuietDate: new Date(lastMessageTime + (lowActivityCheckMins * 6e4)),
                        chatDisplayName,
                    }
                }
            });
        } catch (error) {
            console.error(`SERVER - failed to render home route:`, error);
            res.sendStatus(500);
        }
    });

app.route('/say')
    .get(async ({ query }, res) => {
        const { success, password = "" } = /** @type {{ password?:string, message?:string, success: string }} */(query);

        if (!BOT_CONFIG || !BOT_CLIENT) {
            console.error("SERVER - Bot config missing");
            return res.sendStatus(500);
        }

        try {
            const statusMap = {
                true: `<div class="result success">Message sent to room.</div>`,
                false: `<div class="result error">Error. Could not send message.</div>`,
                undefined: ""
            };

            const { chatDomain, chatRoomId, showTranscriptMessages } = BOT_CONFIG;

            const transcriptMessages = await fetchChatTranscript(BOT_CONFIG, `https://chat.${chatDomain}/transcript/${chatRoomId}`);

            const botChatUser = await BOT_CLIENT.getMe();

            res.render('say', {
                page: {
                    appName: process.env.HEROKU_APP_NAME,
                    title: "Privileged Say"
                },
                heading: `${await botChatUser.name} say to <a href="https://chat.${chatDomain}/rooms/${chatRoomId}" target="_blank">${chatDomain}; room ${chatRoomId}</a>`,
                current: "Say",
                data: {
                    chatDomain,
                    chatRoomId,
                    password,
                    statusText: statusMap[success],
                    transcriptMessages: transcriptMessages.slice(-showTranscriptMessages),
                }
            });
        } catch (error) {
            console.error(`SERVER - failed to display message dashboard:`, error);
            res.sendStatus(500);
        }
    })
    .post(async ({ body = {} }, res) => {
        const { password, message = "" } = /** @type {{ password:string, message?:string }} */(body);

        if (!BOT_CONFIG) {
            console.error("SERVER - bot config missing");
            return res.sendStatus(500);
        }

        try {
            const trimmed = message.trim();

            await BOT_ROOM?.sendMessage(trimmed);

            // Record last activity time only so this doesn't reset an active mute
            BOT_CONFIG.lastActivityTime = Date.now();

            res.redirect(`/say?password=${password}&success=true`);

        } catch (error) {
            console.error(`SERVER - message submit error:`, error);
            res.redirect(`/say?password=${password}&success=false`);
        }
    });

app.route("/server")
    .get((_, res) => {
        try {
            res.render("server", {
                current: "Server",
                heading: "Server Control",
                data: {
                    __dirname,
                    mounted: {
                        client: !!BOT_CLIENT,
                        config: !!BOT_CONFIG,
                        election: !!ELECTION,
                        room: !!BOT_ROOM
                    },
                    paths: {
                        partials: partialsPath,
                        static: staticPath,
                        views: viewsPath
                    },
                    port: app.get("port"),
                    settings: {
                        "escape JSON": !!app.get("json escape"),
                        "ETag": app.get("etag"),
                        "JSONP callback": app.get("jsonp callback name"),
                        "send x-powered-by": !!app.get("x-powered-by"),
                        "strict routing": !!app.get("strict routing"),
                        "subdomain offset": app.get("subdomain offset"),
                        "view cache": !!app.get("view cache"),
                        "view engine": app.get("view engine")
                    }
                },
                routes: routes(app, publicPaths),
                page: {
                    appName: process.env.HEROKU_APP_NAME,
                    title: "Server"
                }
            });

        } catch (error) {
            console.error(`SERVER - failed to display config dashboard:`, error);
            res.sendStatus(500);
        }
    });

app.route('/config')
    .get(async ({ query }, res) => {
        const { success, password = "" } = /** @type {{ password?:string, success: string }} */(query);

        if (!BOT_CONFIG || !BOT_CLIENT) {
            console.error("SERVER - bot config missing");
            return res.sendStatus(500);
        }

        try {
            const statusMap = {
                true: `<div class="result success">Success! Bot will restart with updated environment variables.</div>`,
                false: `<div class="result error">Error. Could not save new values.</div>`,
                undefined: ""
            };

            // Fetch config vars
            const heroku = new HerokuClient(BOT_CONFIG);
            const envVars = await heroku.fetchConfigVars();

            const botChatUser = await BOT_CLIENT.getMe();

            res.render('config', {
                page: {
                    appName: process.env.HEROKU_APP_NAME,
                    title: "Config"
                },
                current: "Config",
                heading: `Update ${await botChatUser.name} environment variables`,
                data: {
                    configObject: envVars,
                    password: password,
                    statusText: statusMap[success],
                }
            });
        } catch (error) {
            console.error(`SERVER - failed to display config dashboard:`, error);
            res.sendStatus(500);
        }
    })
    .post(async (req, res) => {
        const { body } = req;
        const { password, ...fields } = body;

        if (!BOT_CONFIG) {
            console.error("SERVER - bot config missing");
            return res.sendStatus(500);
        }

        try {
            if (BOT_CONFIG.verbose) {
                console.log(`SERVER - submitted body:\n"${JSON.stringify(body)}"`);
            }

            // Validation
            if (Object.keys(fields).length === 0) {
                console.error(`SERVER - invalid request`);
                return res.redirect(`/config?password=${password}&success=false`);
            }

            // Update environment variables
            const heroku = new HerokuClient(BOT_CONFIG);
            const status = await heroku.updateConfigVars(fields);

            if (status && BOT_ROOM) {
                const status = await BOT_ROOM.leave();
                console.log(`SERVER - left room ${BOT_ROOM.id} after update: ${status}`);
            }

            res.redirect(`/config?password=${password}&success=true`);
        } catch (error) {
            console.error(`SERVER - config submit error:`, error);
            res.redirect(`/config?password=${password}&success=false`);
        }
    });

app.route("/ping")
    .get((_, res) => {
        res.sendStatus(200);
    });

app.route("/feedback")
    .get((_, res) => {
        res.render('feedback');
    });


/**
 * @summary sets the server's bot config
 * @param {BotConfig} config bot configuration
 */
export const setBot = (config) => {
    BOT_CONFIG = config;
};

/**
 * @summary sets the server's room
 * @param {Room} room current room
 */
export const setRoom = (room) => {
    BOT_ROOM = room;
};

/**
 * @summary sets the server's room
 * @param {Election} election current election
 */
export const setElection = (election) => {
    ELECTION = election;
};

/**
 * @summary sets the server's chat client
 * @param {Client} client chat client
 */
export const setClient = (client) => {
    BOT_CLIENT = client;
};

/**
 * @summary starts the bot server
 * @param {Client} client chat client
 * @param {Room} room current room the bot is in
 * @param {BotConfig} config  bot configuration
 * @param {Election} election current election
 * @returns {Promise<ExpressApp>}
 */
export const startServer = async (client, room, config, election) => {

    setBot(config);
    setRoom(room);
    setElection(election);
    setClient(client);

    const port = app.get("port");
    const info = `${config.scriptHostname || "the server"} (port ${port})`;

    const started = await start(app, port, info);
    if (started) {
        console.log(`[server] started
dirname  ${__dirname}
partials ${partialsPath}
static   ${staticPath}
views    ${viewsPath}
port     ${port}`);
    }

    /** @param {ExpressApp} app */
    const terminate = (app) => stop(app.get("server"), info).then(() => process.exit(0));

    const farewell = async () => {
        if (config.debug) {
            await room.sendMessage("have to go now, will be back soon...");
        }
        await room.leave();
        terminate(app);
    };

    // https://stackoverflow.com/a/67567395
    if (process.platform === "win32") {
        const rl = await import("readline");
        const rli = rl.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rli.on("SIGINT", farewell);
        return app;
    }

    // https://stackoverflow.com/a/14516195
    process.on('SIGINT', farewell);
    return app;
};
