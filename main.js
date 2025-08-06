const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ActivityType,
  Events,
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const commands = [];

const cogsPath = path.join(__dirname, 'cogs');
const cogFiles = fs.readdirSync(cogsPath).filter(file => file.endsWith('.js'));

for (const file of cogFiles) {
  const filePath = path.join(cogsPath, file);
  const CogClass = require(filePath);

  if (typeof CogClass === 'function') {
    const instance = new CogClass(client);

    if (typeof instance.execute === 'function' && instance.name) {
      client.commands.set(instance.name, instance);
      if (instance.data) {
        commands.push(instance.data.toJSON());
      }
    }

    console.log(`✅ Loaded cog: ${file}`);
  } else if (CogClass.data && CogClass.execute) {
    client.commands.set(CogClass.data.name, CogClass);
    commands.push(CogClass.data.toJSON());
    console.log(`✅ Loaded slash command: ${file}`);
  } else {
    console.log(`⚠️ Skipped invalid cog: ${file}`);
  }
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag} (${client.user.id})`);

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
      { body: [] }
    );
    console.log('🧹 Cleared guild commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
      { body: commands }
    );
    console.log(`✅ Synced ${commands.length} commands to test guild.`);
    console.log('🔍 Registered commands:', commands.map(cmd => cmd.name));
  } catch (error) {
    console.error('❌ Failed to sync slash commands:', error);
  }

  client.user.setPresence({
    status: 'dnd',
    activities: [{ name: 'Working on Nature Customs!', type: ActivityType.Custom }],
  });
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Error executing ${interaction.commandName}:`, error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
      }
    }
  } else {
    for (const command of client.commands.values()) {
      if (typeof command.interactionCreate === 'function') {
        try {
          await command.interactionCreate(interaction);
        } catch (error) {
          console.error(`❌ Error handling interaction in cog ${command.name}:`, error);
        }
      }
    }
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`❌ Error executing ${commandName}:`, error);
    await message.reply('❌ There was an error executing that command.');
  }
});

client.login(process.env.DISCORD_TOKEN);
