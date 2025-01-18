const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMembers
    ]
});
require('dotenv').config();

const token = process.env.DISCORD_TOKEN; // Ganti dengan token bot Anda
const roleId = process.env.ROLE_ID; // Ganti dengan ID role yang ingin di-mention
const channelId = process.env.CHANNEL_ID; // Ganti dengan ID channel tempat bot akan mengirim pesan
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
                    .setColor(0x0099FF) // Warna embed (opsional)
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

client.login(token);