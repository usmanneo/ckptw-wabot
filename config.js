// Module and dependencies required
const pkg = require("./package.json");
const {
    monospace,
    italic,
    quote
} = require("@mengkodingan/ckptw");

// Configuration
global.config = {
    // Basic bot information
    bot: {
        name: "H4K3R TOOLS", // Bot name
        prefix: /^[°•π÷×¶∆£¢€¥®™+✓_=|/~!?@#%^&.©^]/i, // Allowed command prefix characters
        phoneNumber: "447822011297", // Bot's phone number (optional if using QR code)
        thumbnail: "https://c.top4top.io/p_3261rguno1.jpg", // Bot thumbnail image
        website: "https://chat.whatsapp.com/FaqPYCEsxE95vr4SP78HeD" // WhatsApp bot website
    },

    // Customized bot messages for specific situations
    msg: {
        admin: quote("⛔ This command can only be accessed by group admins!"), // Message for admin-only commands
        banned: quote("⛔ Cannot process because you are banned!"), // Message for banned users
        botAdmin: quote("⛔ Bot is not an admin, cannot use this command!"), // Message if the bot is not a group admin
        cooldown: quote("🔄 This command is on cooldown, please wait..."), // Message during command cooldown
        coin: quote("⛔ You don't have enough coins!"), // Message for insufficient coins
        group: quote("⛔ This command can only be accessed in groups!"), // Message for group-only commands
        owner: quote("⛔ This command can only be accessed by the owner!"), // Message for owner-only commands
        premium: quote("⛔ You are not a Premium user!"), // Message for non-Premium users
        private: quote("⛔ This command can only be accessed in private chats!"), // Message for private chat-only commands
        restrict: quote("⛔ This command has been restricted for security reasons!"), // Restricted command message

        watermark: `@${pkg.name} / v${pkg.version}`, // Bot name and version watermark
        footer: italic("Developed by H4K3R"), // Bot message footer
        readmore: "\u200E".repeat(4001), // Read more string

        wait: quote("🔄 Please wait..."), // Loading message
        notFound: quote("❎ Nothing found! Try again later."), // Item not found message
        urlInvalid: quote("❎ Invalid URL!") // Invalid URL message
    },

    // Bot owner information
    owner: {
        name: "H4K3R", // Bot owner's name
        number: "447822011297", // Bot owner's phone number
        organization: "", // Bot owner's organization name
        co: [""] // Co-owner phone numbers
    },

    // Bot sticker configuration
    sticker: {
        packname: "Sticker created by", // Sticker package name
        author: "@ckptw-wabot" // Sticker creator
    },

    // Bot system settings
    system: {
        autoRead: true, // Whether the bot automatically reads incoming messages
        autoTypingOnCmd: true, // Enable typing status when processing commands
        cooldown: 5000, // Command cooldown time in milliseconds
        restrict: false, // Restrict certain commands for security
        selfOwner: true, // Whether the bot acts as the owner
        selfReply: true, // Whether the bot replies to messages it sends itself
        timeZone: "Asia/Jakarta", // Bot's time zone
        usePairingCode: false // Use pairing code for connection
    }
};
