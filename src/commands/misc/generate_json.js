const { SlashCommandBuilder, TextChannel } = require("discord.js");
const applications = require("./data/applications.json");
const { join } = require("path");
const fs = require("fs");

const default_channel_id = "1210859945122205746"; // #announcements

const allowed_roles = [
  "1094080360922497114", // director
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("generate_json")
    .setDescription("Generates JSON invites for users"),
  async execute(interaction, client, storage) {
    // Ensure the user has the correct role
    if (
      !interaction.member.roles.cache.some((role) =>
        allowed_roles.includes(role.id)
      )
    ) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }
    // Get the channel to create the invite for
    const channel =
      interaction.options.getChannel("channel") ||
      interaction.guild.channels.cache.get(default_channel_id);
    if (!channel) {
      await interaction.reply({
        content: "The specified channel does not exist.",
        ephemeral: true,
      });
      return;
    }
    // Create the invite
    async function generate_invite() {
      const invite = await channel.createInvite({
        maxAge: 0, // no expiration
        maxUses: 1,
        unique: true,
      });
    }
    await interaction.reply({
      content: "Working...",
      ephemeral: true,
    });
    const newjson = [];
    const total_applications = applications.length;
    let current_application = 0;
    for (const user of applications) {
      newjson.push({
        ...user,
        invite: user.approved ? await generate_invite() : "NA",
      });
      // sleep for a second
      if (user.approved) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      current_application++;
      console.log(`${current_application}/${total_applications}`);
    }
    await interaction.editReply({
      content: "done",
      ephemeral: true,
    });
    // write the newjson to a file
    const file_path = join(__dirname, "data", "new_applications.json");
    fs.writeFileSync(file_path, JSON.stringify(newjson, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  },
};
