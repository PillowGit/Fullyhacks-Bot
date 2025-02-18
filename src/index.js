/*
 *
 * Module imports section
 *
 */

// Basic file system path imports - used to init/find commands with the bot
const path = require("node:path");
const fs = require("node:fs");
// Necessary imports for discord.js
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  IntentsBitField,
  EmbedBuilder,
} = require("discord.js");
// Importing environment variables
const { token } = require("./env.json");

/*
 *
 * Bot setup section
 *
 */

// Initialize our discord bot with given intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
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
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Define what we should do with button interactions
async function handleButton(interaction) {
  console.log("A button was pressed:");
  console.log(interaction.customId);
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
    await command.execute(interaction, client, null);
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
