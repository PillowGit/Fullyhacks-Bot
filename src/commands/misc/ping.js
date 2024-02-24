const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Reports the bots ping"),
  async execute(interaction, client, storage) {
    const ms_diff =
      new Date().getMilliseconds() - interaction.createdAt.getMilliseconds();
    await interaction.reply({
      content: ms_diff.toString().concat("ms"),
      ephemeral: true,
    });
  },
};
