// Required modules and dependencies
const {
    Client,
    CommandHandler,
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const {
    Events,
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const {
    exec
} = require("child_process");
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");
const util = require("util");

// Connection message
console.log(`[${config.pkg.name}] Connecting...`);

// Create a new bot instance
const bot = new Client({
    WAVersion: [2, 3000, 1015901307],
    phoneNumber: config.bot.phoneNumber,
    prefix: config.bot.prefix,
    readIncommingMsg: config.system.autoRead,
    printQRInTerminal: !config.system.usePairingCode,
    selfReply: config.system.selfReply,
    usePairingCode: config.system.usePairingCode
});

// Handle the event when the bot is ready
bot.ev.once(Events.ClientReady, async (m) => {
    console.log(`[${config.pkg.name}] Ready at ${m.user.id}`);
    if (!await db.get("bot.mode")) await db.set("bot.mode", "public");

    // Set the configuration for the bot
    const number = m.user.id.split(":")[0];
    await Promise.all([
        config.bot.number = number,
        config.bot.id = `${number}@s.whatsapp.net`,
        config.bot.readyAt = bot.readyAt,
        config.bot.dbSize = fs.existsSync("database.json") ? tools.general.formatSize(fs.statSync("database.json").size / 1024) : "N/A"
    ]);
});

// Create a command handler and load commands
const cmd = new CommandHandler(bot, path.resolve(__dirname, "commands"));
cmd.load();

// Handle the event when a message appears
bot.ev.on(Events.MessagesUpsert, async (m, ctx) => {
    const isGroup = ctx.isGroup();
    const isPrivate = !isGroup;
    const senderJid = ctx.sender.jid;
    const senderNumber = senderJid.split(/[:@]/)[0];
    const groupJid = isGroup ? ctx.id : null;
    const groupNumber = isGroup ? groupJid.split("@")[0] : null;

    // Handle the bot mode
    const botMode = await db.get("bot.mode");
    if (isPrivate && botMode === "group") return;
    if (isGroup && botMode === "private") return;
    if (!tools.general.isOwner(ctx, senderNumber, true) && botMode === "self") return;

    // Log incoming messages
    if (isGroup) {
        console.log(`[${config.pkg.name}] Incoming message from group: ${groupNumber}, by: ${senderNumber}`);
    } else {
        console.log(`[${config.pkg.name}] Incoming message from: ${senderNumber}`);
    }

    // Group or Private Handling
    if (isGroup || isPrivate) {
        // Handle the database
        const userDb = await db.get(`user.${senderNumber}`);
        if (!userDb) {
            await db.set(`user.${senderNumber}`, {
                coin: 1000,
                level: 0,
                uid: tools.general.generateUID(senderNumber),
                xp: 0
            });
        }

        if (tools.general.isOwner(ctx, senderNumber, config.system.selfOwner) || await db.get(`user.${senderNumber}.isPremium`)) {
            const userCoin = await db.get(`user.${senderNumber}.coin`);
            if (userCoin > 0) await db.delete(`user.${senderNumber}.coin`);
        }

        // Handle commands
        const isCmd = tools.general.isCmd(m, ctx);
        if (isCmd) {
            await db.set(`user.${senderNumber}.lastUse`, Date.now());
            await db.set(`group.${groupNumber}.lastUse`, Date.now());
            if (config.system.autoTypingOnCmd) await ctx.simulateTyping(); // Simulate typing for commands

            // "Did you mean?" suggestions
            const mean = isCmd.didyoumean;
            const prefix = isCmd.prefix;
            const input = isCmd.input;

            if (mean) await ctx.reply(quote(`🤔 Did you mean ${monospace(prefix + mean)}?`));

            // XP and Level handling for users
            const xpGain = 10;
            let xpToLevelUp = 100;

            const [userXp, userLevel, userAutolevelup] = await Promise.all([
                db.get(`user.${senderNumber}.xp`) || 0,
                db.get(`user.${senderNumber}.level`) || 1,
                db.get(`user.${senderNumber}.autolevelup`) || false
            ]);

            let newUserXp = userXp + xpGain;

            if (newUserXp >= xpToLevelUp) {
                let newUserLevel = userLevel + 1;
                newUserXp -= xpToLevelUp;

                xpToLevelUp = Math.floor(xpToLevelUp * 1.2);

                let profilePictureUrl;
                try {
                    profilePictureUrl = await bot.core.profilePictureUrl(senderJid, "image");
                } catch (error) {
                    profilePictureUrl = "https://i.pinimg.com/736x/70/dd/61/70dd612c65034b88ebf474a52ccc70c4.jpg";
                }

                if (userAutolevelup) await ctx.reply({
                    text: `${quote(`Congratulations! You've leveled up to level ${newUserLevel}!`)}\n` +
                        `${config.msg.readmore}\n` +
                        quote(tools.msg.generateNotes([`Disturbed? Type ${monospace(`${prefix}setprofile autolevelup`)} to disable autolevelup messages.`])),
                    contextInfo: {
                        externalAdReply: {
                            mediaType: 1,
                            previewType: 0,
                            mediaUrl: config.bot.website,
                            title: config.msg.watermark,
                            body: null,
                            renderLargerThumbnail: true,
                            thumbnailUrl: profilePictureUrl || config.bot.thumbnail,
                            sourceUrl: config.bot.website
                        }
                    }
                });

                await Promise.all([
                    db.set(`user.${senderNumber}.xp`, newUserXp),
                    db.set(`user.${senderNumber}.level`, newUserLevel)
                ]);
            } else {
                await db.set(`user.${senderNumber}.xp`, newUserXp);
            }
        }

        // Owner-specific commands
        if (tools.general.isOwner(ctx, senderNumber, config.system.selfOwner)) {
            // Eval command: Execute JavaScript code
            if (m.content && m.content.startsWith && (m.content.startsWith("==> ") || m.content.startsWith("=> "))) {
                const code = m.content.slice(m.content.startsWith("==> ") ? 4 : 3);

                try {
                    const result = await eval(m.content.startsWith("==> ") ? `(async () => { ${code} })()` : code);

                    await ctx.reply(monospace(util.inspect(result)));
                } catch (error) {
                    console.error(`[${config.pkg.name}] Error:`, error);
                    await ctx.reply(quote(`⚠️ An error occurred: ${error.message}`));
                }
            }

            // Exec command: Run shell commands
            if (m.content && m.content.startsWith && m.content.startsWith("$ ")) {
                const command = m.content.slice(2);

                try {
                    const output = await util.promisify(exec)(command);

                    await ctx.reply(monospace(output.stdout || output.stderr));
                } catch (error) {
                    console.error(`[${config.pkg.name}] Error:`, error);
                    await ctx.reply(quote(`⚠️ An error occurred: ${error.message}`));
                }
            }
        }
    }
});

// Handle group join and leave events
bot.ev.on(Events.UserJoin, async (m) => {
    m.eventsType = "UserJoin";
    handleUserEvent(m);
});

bot.ev.on(Events.UserLeave, async (m) => {
    m.eventsType = "UserLeave";
    handleUserEvent(m);
});

// Launch the bot
bot.launch().catch((error) => console.error(`[${config.pkg.name}] Error:`, error));

// Utility function to handle user events
async function handleUserEvent(m) {
    const {
        id,
        participants
    } = m;

    try {
        const groupNumber = id.split("@")[0];
        const getWelcome = await db.get(`group.${groupNumber}.option.welcome`);

        if (getWelcome) {
            const metadata = await bot.core.groupMetadata(id);
            const textWelcome = await db.get(`group.${groupNumber}.text.welcome`);
            const textGoodbye = await db.get(`group.${groupNumber}.text.goodbye`);

            for (const jid of participants) {
                let profilePictureUrl;
                try {
                    profilePictureUrl = await bot.core.profilePictureUrl(jid, "image");
                } catch (error) {
                    profilePictureUrl = "https://i.pinimg.com/736x/70/dd/61/70dd612c65034b88ebf474a52ccc70c4.jpg";
                }

                const eventType = m.eventsType;
                const customText = eventType === "UserJoin" ? textWelcome : textGoodbye;
                const userTag = `@${jid.split("@")[0]}`;

                const text = customText ?
                    customText
                    .replace(/%tag%/g, userTag)
                    .replace(/%subject%/g, metadata.subject)
                    .replace(/%description%/g, metadata.description) :
                    (eventType === "UserJoin" ?
                        quote(`👋 Welcome ${userTag} to the group ${metadata.subject}!`) :
                        quote(`👋 ${userTag} has left the group ${metadata.subject}.`));

                await bot.core.sendMessage(id, {
                    text,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            mediaType: 1,
                            previewType: 0,
                            mediaUrl: config.bot.website,
                            title: config.msg.watermark,
                            body: null,
                            renderLargerThumbnail: true,
                            thumbnailUrl: profilePictureUrl || config.bot.thumbnail,
                            sourceUrl: config.bot.website
                        }
                    }
                });

                const introText = await db.get(`group.${groupNumber}.text.intro`);
                if (eventType === "UserJoin" && introText) await bot.core.sendMessage(id, {
                    text: introText,
                    mentions: [jid]
                });
            }
        }
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        await bot.core.sendMessage(id, {
            text: quote(`⚠️ An error occurred: ${error.message}`)
        });
    }
}
