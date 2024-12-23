const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "setoption",
    aliases: ["setopt"],
    category: "group",
    handler: {
        admin: true,
        botAdmin: true,
        group: true
    },
    code: async (ctx) => {
        const status = await handler(ctx, module.exports.handler);
        if (status) return;

        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(`${tools.msg.generateInstruction(["send"], ["text"])}`)}\n` +
            `${quote(tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "antilink"))}\n` +
            quote(tools.msg.generateNotes([`Ketik ${monospace(`${ctx._used.prefix + ctx._used.command} list`)} untuk melihat daftar.`, `Ketik ${monospace(`${ctx._used.prefix + ctx._used.command} status`)} untuk melihat status.`]))
        );

        if (ctx.args[0] === "list") {
            const listText = await tools.list.get("setoption");
            return await ctx.reply(listText);
        }

        if (ctx.args[0] === "status") {
            const groupNumber = ctx.isGroup() ? ctx.id.split("@")[0] : null;
            const [groupAntilink, groupAntitoxic, groupAutokick, groupWelcome] = await Promise.all([
                db.get(`group.${groupNumber}.option.antilink`),
                db.get(`group.${groupNumber}.option.antitoxic`),
                db.get(`group.${groupNumber}.option.autokick`),
                db.get(`group.${groupNumber}.option.welcome`)
            ]);

            return await ctx.reply(
                `${quote(`Antilink: ${groupAntilink ? "Aktif" : "Nonaktif"}`)}\n` +
                `${quote(`Antitoxic: ${groupAntitoxic ? "Aktif" : "Nonaktif"}`)}\n` +
                `${quote(`Autokick: ${groupAutokick ? "Aktif" : "Nonaktif"}`)}\n` +
                `${quote(`Welcome: ${groupWelcome ? "Aktif" : "Nonaktif"}`)}\n` +
                "\n" +
                config.msg.footer
            );
        }

        try {
            const groupNumber = ctx.isGroup() ? ctx.id.split("@")[0] : null;
            let setKey;

            switch (input.toLowerCase()) {
                case "antilink":
                    setKey = `group.${groupNumber}.option.antilink`;
                    break;
                case "antitoxic":
                    setKey = `group.${groupNumber}.option.antitoxic`;
                    break;
                case "autokick":
                    setKey = `group.${groupNumber}.option.autokick`;
                    break;
                case "welcome":
                    setKey = `group.${groupNumber}.option.welcome`;
                    break;
                default:
                    return await ctx.reply(quote(`❎ Key '${input}' tidak valid!`));
            }

            const currentStatus = await db.get(setKey);
            const newStatus = !currentStatus;

            await db.set(setKey, newStatus);
            const statusText = newStatus ? "diaktifkan" : "dinonaktifkan";
            return await ctx.reply(quote(`✅ Fitur '${input}' berhasil ${statusText}!`));
        } catch (error) {
            console.error(`[${config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};