const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const discordTranscripts = require('discord-html-transcripts');
const simpleGit = require('simple-git');
const git = simpleGit();

const CATEGORY_ID = '1402190529676054591';
const STAFF_ROLE_ID = '1389142790989938730';
const LOG_CHANNEL_ID = '1402411243717005374';

module.exports = class TicketHandler {
  constructor(client) {
    this.client = client;
    this.name = 'tickethandler';

    client.on('interactionCreate', async interaction => {
      try {
        
        if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {
          const inquiry = interaction.fields.getTextInputValue('inquiry');

          const ticketChannel = await interaction.guild.channels.create({
            name: `help-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            topic: interaction.user.id,
            permissionOverwrites: [
              { id: interaction.guild.roles.everyone, deny: ['ViewChannel'] },
              { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
              { id: STAFF_ROLE_ID, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] }
            ]
          });

          const bannerEmbed = new EmbedBuilder()
            .setImage('https://media.discordapp.net/attachments/1373060476027535461/1402179246117486683/HAVEN.zip_-_78.png');

          const supportEmbed = new EmbedBuilder()
            .setTitle('Assistance')
            .setDescription(
              `Thanks for contacting **Nature Customs Support**. Please wait patiently for a support representative.\n\n` +
              `> **User Inquiry:**\n> ${inquiry}\n\n` +
              `-# Please provide any additional information if needed. Pinging staff may result in a warning.`
            )
            .setImage('https://media.discordapp.net/attachments/1373060476027535461/1402179176483655731/ROLEPLAY.png.png');

          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim Ticket').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Secondary)
          );

          await ticketChannel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [bannerEmbed, supportEmbed],
            components: [buttons]
          });

          await interaction.reply({
            content: `<:naturelogo:1402194461043195944> A ticket has been created: ${ticketChannel}`,
            ephemeral: true
          });
        }

        
        if (interaction.isButton() && interaction.customId === 'claim_ticket') {
          const claimedEmbed = new EmbedBuilder()
            .setTitle('Ticket Claimed')
            .setDescription(`This ticket has been claimed by ${interaction.user}.`);

          await interaction.reply({ embeds: [claimedEmbed] });
        }

        
        if (interaction.isButton() && interaction.customId === 'close_ticket') {
          try {
            await interaction.reply({ content: '✅ Ticket closed.', ephemeral: true });

            
            const transcript = await discordTranscripts.createTranscript(interaction.channel, {
              returnType: 'string',
              limit: -1,
              footerText: "Exported {number} message{s}",
              poweredBy: true,
              ssr: true
            });

            
            const transcriptsDir = path.join(__dirname, '..', 'transcripts');
            if (!fs.existsSync(transcriptsDir)) {
              fs.mkdirSync(transcriptsDir);
            }

           
            const fileName = `ticket-${interaction.channel.id}.html`;
            const filePath = path.join(transcriptsDir, fileName);
            fs.writeFileSync(filePath, transcript, 'utf8');

           
            await git.remote(['set-url', 'origin', `https://${process.env.GITHUB_TOKEN}@github.com/rashaunreincarnated/ticket-transcripts.git`]);

           
            await git.add(`transcripts/${fileName}`);
            await git.commit(`Add transcript for ${interaction.channel.name}`);
            await git.push('origin', 'main');

            
            const logChannel = await interaction.guild.channels.fetch(LOG_CHANNEL_ID);
            const transcriptURL = `https://rashaunreincarnated.github.io/ticket-transcripts/transcripts/${fileName}`;
            await logChannel.send({
              content: `📄 Transcript for closed ticket <#${interaction.channel.id}>:\n${transcriptURL}`,
            });

           
            await interaction.channel.delete();
          } catch (error) {
            console.error('❌ Error closing ticket:', error);
            await interaction.followUp({ content: '❌ Failed to close ticket.', ephemeral: true });
          }
        }
      } catch (error) {
        console.error('❌ Error in tickethandler:', error);
      }
    });
  }
};