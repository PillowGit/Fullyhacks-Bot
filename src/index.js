/*
 *
 * Module imports section
 *
 */

// Basic file system path imports - used to init/find commands with the bot
const path = require("node:path");
const fs = require("node:fs");
// Necessary imports for discord.js
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField, EmbedBuilder } = require("discord.js");
// Easy persistent json storage
const storage = require('node-persist')
// Importing environment variables
const { token } = require("./env.json");

/*
 *
 * Bot setup section
 *
 */

// Create a persistent storage object to pass to functions when necessary
storage.init({
  dir: './storage',
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: "utf8",
  logging: false,
  ttl: false,
  expiredInterval: 2 * 60 * 1000,
  forgiveParseErrors: false,
  writeQueue: false,
  writeQueueIntervalMs: 1000,
  writeQueueWriteOnlyLast: false,
});

// Initialize our discord bot with given intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent],
});

// Initialize a command collection to add our commands to
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Read all our folders and initialize stored commands
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Define what we should do with button interactions
const reqchannelid = "1209575418081050724";
const announcementChannel = "1209575329916784730";
const announcementRole = "1203512307230052442";
async function handleButton(interaction) {
  // Gets the interaction id this response originated from
  const targetId = interaction.customId.substring(0, interaction.customId.length - 1);
  const data = await storage.getItem(targetId);
  // Decide what to do based on the buttons id
  const reqChannel = await client.channels.cache.get(reqchannelid);
  const reqMessage = await reqChannel.messages.fetch(data[0]);
  const targetEmbed = reqMessage.embeds[0];
  let responseEmbed = null;
  if (interaction.customId.charAt(interaction.customId.length - 1) === "0") {
      // On Deny
      responseEmbed = new EmbedBuilder()
          .setColor("#c73241")
          .setTitle(targetEmbed.data.title)
          .setDescription(data[1])
          .setFooter({text: `Denied by ${interaction.user.tag}`});
  } else {
      // On Accept
      responseEmbed = new EmbedBuilder()
          .setColor("#1ebd3b")
          .setTitle(targetEmbed.data.title)
          .setDescription(data[1])
          .setFooter({text: `Approved by ${interaction.user.tag}`});
      const finalChannel = await client.channels.cache.get(announcementChannel);
      await finalChannel.send({
          content: `<@&${announcementRole}>\nNew announcement from <@${data[2]}>:\n\n${data[1]}`
      });
  }
  await reqMessage.edit({embeds: [responseEmbed], components: []});
  await storage.removeItem(targetId);
}

// Link interaction creation events with their associated / command
client.on(Events.InteractionCreate, async (interaction) => {
  // Look for button input, if so, link to button handler
  if (interaction.isButton()) { 
    await handleButton(interaction);
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  try {
    // Pass the client and storage objects to every command we run!
    await command.execute(interaction, client, storage);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

/*
 *
 * Other bot behavior (i.e. event listeners)
 *
 */

// Define startup behavior
client.once(Events.ClientReady, (c) => {
  console.log(`Ready, Logged in as ${c.user.tag}`);
});

/*
 *
 * EOF
 *
 */

// Start the bot
client.login(token);
