const {
    createAPIUrl
} = require("../tools/api.js");
const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");
const mime = require("mime-types");

module.exports = {
    name: "igdl",
    aliases: ["ig", "instagram", "instagramdl"],
    category: "downloader",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            coin: 3
        });
        if (status) return ctx.reply(message);

        const url = ctx._args[0] || null;

        if (!url) return ctx.reply(
            `${quote(global.msg.argument)}\n` +
            quote(`Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} https://example.com/`)}`)
        );

        const urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
        if (!urlRegex.test(url)) return ctx.reply(global.msg.urlInvalid);

        try {
            const apiUrl = createAPIUrl("vkrdownloader", "/server", {
                vkr: url
            });
            const response = await axios.get(apiUrl);
            const {
                data
            } = response.data;

            for (const download of data.downloads) {
                const mimeType = mime.contentType(download.extension);

                if (mimeType.startsWith('image/')) {
                    await ctx.reply({
                        image: {
                            url: download.url
                        },
                        mimetype: mimeType
                    });
                } else if (mimeType.startsWith('video/')) {
                    await ctx.reply({
                        video: {
                            url: download.url
                        },
                        mimetype: mimeType
                    });
                }
            }
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};