const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = class TicketPanel {
  constructor(client) {
    this.client = client;
    this.name = 'ticketpanel';
  }

  async execute(message) {
    const embed1 = new EmbedBuilder().setImage(
      "https://media.discordapp.net/attachments/1373060476027535461/1402179242611052554/HAVEN.zip_-_70.png"
    );

    const embed2 = new EmbedBuilder()
      .setDescription("> Welcome to **<:N_:1402345121332068474>ature Customs!** We specialize in **ER:LC & Maple County** designs, offering high quality liveries, Clothing, Branding and more to help roleplay communities look the part.")
      .setImage("https://media.discordapp.net/attachments/1373060476027535461/1402179176483655731/ROLEPLAY.png.png")
      .addFields(
        {
          name: "<:roblox:1402320108810010624> **Roblox Group**",
          value: "[Click Here](https://www.roblox.com/communities/74349872/Nature-Customs-Designs#!/about)",
          inline: true,
        },
        {
          name: "<:store:1402332971884871730> Get Started",
          value: "[Click Here](https://discord.com/channels/1389129242423332884/1402174093742051358)",
          inline: true,
        },
        {
          name: "<:Marketplace:1402333517123293224> Marketplace",
          value: "[Click Here](https://discord.com/channels/1389129242423332884/1389134964880310342)",
          inline: true,
        }
      );

    const dropdown = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('info_dropdown')
        .setPlaceholder('Nature Customs.')
        .addOptions(
          {
            label: 'About Us',
            description: 'View info about Nature Customs',
            value: 'about_us',
            emoji: { name: 'info', id: '1402337186740965406' }
          },
          {
            label: 'Server Rules',
            description: 'Our server rules, you must review.',
            value: 'server_rules',
            emoji: { name: 'announcement', id: '1402378123269636147' }
          }
        )
    );

    const helpButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Help')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({
      embeds: [embed1, embed2],
      components: [dropdown, helpButton]
    });

    await message.delete();
  }

  async interactionCreate(interaction) {
    try {
      if (interaction.isStringSelectMenu() && interaction.customId === 'info_dropdown') {
        const selected = interaction.values[0];

        const embed1 = new EmbedBuilder().setImage(
          "https://media.discordapp.net/attachments/1373060476027535461/1402179242611052554/HAVEN.zip_-_70.png"
        );

        let embed2;
        if (selected === 'about_us') {
          embed2 = new EmbedBuilder()
             .setDescription("At **Nature Customs,** our mission is to cultivate the creative roots behind every custom design. We’re dedicated to delivering precise, high-quality creations that bring your unique vision to life. By combining innovation with attention to detail, we aim to be the natural force behind your creative journey — where every idea flourishes and every design makes an impact.\n\n<:Verified:1402335595635933356> Founded by **Arod_015** on August 4th, 2025, Nature Customs was built from the ground up with a clear passion for design — no shortcuts, no conversions from roleplay servers. From the very beginning, Arod envisioned creating one of the top design communities in the space, and that vision has become a reality. Backed by a dedicated team of HRs and staff, Nature Customs continues to grow and thrive, delivering high-quality, precision-driven designs every single day.")
            .setImage("https://media.discordapp.net/attachments/1373060476027535461/1402179176483655731/ROLEPLAY.png.png");
        } else if (selected === 'server_rules') {
          embed2 = new EmbedBuilder()
            .setDescription("``  1  ``**Respect**\nAll members are expected to show respect to one another at all times. Discrimination, harassment, or hate speech based on race, religion, political beliefs, gender identity, or sexual orientation will not be tolerated. This applies equally to all members, staff, and designers.\n\n``  2  ``   **Privacy and Leaking**\nThe privacy of our members is a top priority. Sharing or leaking any personal or sensitive information — such as addresses, P.O. boxes, private social media accounts, IP addresses, or similar — is strictly forbidden.\n\n``  3  ``   **NSFW**\nAll content shared in the server must be appropriate and safe for work. Posting or linking to explicit, graphic, or disturbing content — including gore, NSFW material, or offensive imagery — is strictly prohibited. This includes usernames, profile pictures, external links, and embedded media.")
            .setImage("https://media.discordapp.net/attachments/1373060476027535461/1402179176483655731/ROLEPLAY.png.png");
        }

        await interaction.reply({ embeds: [embed1, embed2], ephemeral: true });
      }

      if (interaction.isButton() && interaction.customId === 'open_ticket') {
        const modal = new ModalBuilder()
          .setCustomId('ticket_modal')
          .setTitle('Submit a Ticket');

        const inquiryInput = new TextInputBuilder()
          .setCustomId('inquiry')
          .setLabel('What do you need help with?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(inquiryInput);
        modal.addComponents(row);
        return interaction.showModal(modal);
      }
    } catch (error) {
      console.error('Error in ticketpanel interactionCreate:', error);
    }
  }
};
