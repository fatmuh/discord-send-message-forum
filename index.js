const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});
require('dotenv').config();

const token = process.env.DISCORD_TOKEN; // Ganti dengan token bot Anda
const roleId = process.env.ROLE_ID; // Ganti dengan ID role yang ingin di-mention
const roleUpdateId = process.env.ROLE_UPDATE_ID; // Ganti dengan ID role yang ingin di-mention
const channelId = process.env.CHANNEL_ID; // Ganti dengan ID channel tempat bot akan mengirim pesan
const channelUpdateId = process.env.CHANNEL_UPDATE_ID; // Ganti dengan ID channel tempat bot akan mengirim pesan
const forumId = process.env.FORUM_ID; // Ganti dengan ID forum yang ingin dipantau

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('threadCreate', async (thread) => {
    // Pastikan thread yang dibuat adalah di forum tertentu
    if (thread.parentId === forumId) {
        const channel = client.channels.cache.get(channelId);
        const author = await thread.guild.members.fetch(thread.ownerId);
        const authorName = author.user.username;
        const authorAvatar = author.user.displayAvatarURL({ dynamic: true, size: 128 }); // URL avatar
        const messages = await thread.messages.fetch({ limit: 1 });
        const firstMessage = messages.first();
        const description = firstMessage.content;
        const image = firstMessage.attachments.first()?.url || null;

        if (channel) {
            const role = thread.guild.roles.cache.get(roleId);
            if (role) {
                // Buat pesan mention
                const mentionMessage = `${role} ada garapan baru **${thread.name}** sudah ada di channel diskusi garapan, jangan lupa tinggalin jejak ya`;
                const embed = new EmbedBuilder()
                    .setAuthor({ name: authorName, iconURL: authorAvatar })
                    .setColor(0x34d399) // Warna embed (opsional)
                    .setTitle(`${thread.name}`)
                    .setDescription(`https://discord.com/channels/${thread.guild.id}/${thread.id}\n\n${description}`)
                    .addFields(
                        { name: 'Notes', value: 'Garap Dongo Jangan Males!', inline: true },
                    )
                    .setFooter({ text: 'Garapan BOT' });

                if (image) {
                    embed.setImage(image);
                }

                // Kirim pesan mention terlebih dahulu
                channel.send({
                    content: mentionMessage, // Teks mention
                    embeds: [embed] // Embed
                })
                    .then(() => console.log('Mention and embed message sent successfully!'))
                    .catch(err => console.error('Failed to send message:', err));
            } else {
                console.error('Role not found.');
            }
        } else {
            console.error('Channel not found.');
        }
    } else {
        console.log('Thread is not in the specified forum.');
    }
});

// Event ketika ada pesan baru di thread
client.on('messageCreate', async (message) => {
    // Pastikan pesan dikirim di dalam thread
    if (message.channel.isThread() && message.channel.parentId === forumId) {
        const channel = client.channels.cache.get(channelUpdateId);
        if (!channel) {
            console.error('Channel not found.');
            return;
        }

        // Periksa jika pesan memiliki mention ke role tertentu
        const role = message.guild.roles.cache.get(roleId);
        if (!role) {
            console.error('Role not found.');
            return;
        }

        if (message.mentions.roles.has(roleUpdateId)) {
            const authorName = message.author.username;
            const authorAvatar = message.author.displayAvatarURL({ dynamic: true, size: 128 });
            const content = message.content;
            const image = message.attachments.first()?.url || null;

            const embed = new EmbedBuilder()
                .setAuthor({ name: authorName, iconURL: authorAvatar })
                .setColor(0x3b82f6) // Warna embed (opsional)
                .setDescription(`https://discord.com/channels/${message.guild.id}/${message.channel.id}\n\n${content}`)
                .setFooter({ text: 'Garapan BOT' });

            if (image) {
                embed.setImage(image);
            }

            // Kirim pesan ke channel target
            channel.send({
                content: `${role} ada update baru dari **${message.channel.name}** dikirim sama **${authorName}**.`,
                embeds: [embed]
            })
                .then(() => console.log('Mention detected and message forwarded!'))
                .catch(err => console.error('Failed to forward message:', err));
        }
    }
});

client.login(token);