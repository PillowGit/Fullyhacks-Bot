const { SlashCommandBuilder, TextChannel } = require("discord.js");

const default_channel_id = "1210859945122205746";

const allowed_roles = [
  "1094080360922497114", // director
  "1153158917333987378", // team lead
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new_invite")
    .setDescription("Makes a new single use invite to the specified channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "The channel to create the invite for (defaults to start-here)"
        )
        .setRequired(false)
    ),
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
    const invite = await channel.createInvite({
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      maxUses: 1, // 1 means the invite can only be used once
      unique: true,
    });
    // Send the invite to the user
    await interaction.reply({
      content: `Here is your invite to ${channel}. It expires in 24 hours: ${invite}`,
      ephemeral: true,
    });
  },
};
