const {
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "hidetag",
    aliases: ["ht"],
    category: "group",
    handler: {
        admin: true,
        group: true
    },
    code: async (ctx) => {
        const status = await handler(ctx, module.exports.handler);
        if (status) return;

        const input = ctx.args.join(" ") || "Saya tidak tahu harus mengetik apa...";

        try {
            const members = await ctx.group().members();
            const mentions = members.map(member => member.id);

            return await ctx.reply({
                text: input,
                mentions
            });
        } catch (error) {
            console.error(`[${config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};