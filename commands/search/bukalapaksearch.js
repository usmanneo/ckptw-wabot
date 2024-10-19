const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "bukalapaksearch",
    aliases: ["bukalapak", "bukalapaks"],
    category: "search",
    handler: {
        banned: true,
        cooldown: true,
        coin: [10, "text", 1]
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(global.tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "evangelion"))
        );

        try {
            const apiUrl = await global.tools.api.createUrl("widipe", "/bukalapak", {
                text: input
            });
            const {
                data
            } = await axios.get(apiUrl);

            const resultText = data.result.map((d) =>
                `${quote(`Nama: ${d.title}`)}\n` +
                `${quote(`Penilaian: ${d.rating}`)}\n` +
                `${quote(`Terjual: ${d.terjual}`)}\n` +
                `${quote(`Harga: ${d.harga}`)}\n` +
                `${quote(`Toko: ${d.store.nama} - ${d.store.lokasi} (${d.store.link})`)}\n` +
                `${quote(`URL: ${d.link}`)}`
            ).join(
                "\n" +
                `${quote("─────")}\n`
            );
            return await ctx.reply(
                `${resultText}\n` +
                "\n" +
                global.config.msg.footer
            );
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return await ctx.reply(global.config.msg.notFound);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};