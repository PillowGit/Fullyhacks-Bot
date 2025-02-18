const { SlashCommandBuilder } = require("discord.js");

const director_role_id = "1094080360922497114";
const do_not_purge_role_ids = [
  "1086436632460263434",
  "1287211999335284756",
  "1153158917333987378",
  "1180744546154455112",
  "1092556182943707207",
  "1092556309636845662",
  "1086463177597915246",
  "1094080360922497114",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge_non_organizers")
    .setDescription(
      "Purges everyone that doesn't have the organizer role. Only usable by Directors"
    ),
  async execute(interaction, client, storage) {
    // Check if the user has the director role
    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === director_role_id
      )
    ) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    // Announce start
    await interaction.reply({
      content: "Purging non-organizers...",
    });

    // Get a list of all members in the guild
    const members = await interaction.guild.members.fetch();
    // Iterate over each member, using a for loop so we can wait between each kick
    for (const member of members.values()) {
      // Skip the member if they have any of the roles that should not be purged, also skip self
      if (
        member.roles.cache.some((role) =>
          do_not_purge_role_ids.includes(role.id)
        ) ||
        member.id === client.user.id
      ) {
        continue;
      }
      // Kick the member
      console.log(`Kicking ${member.displayName} (${member.id})`);
      await member.kick();
      // Wait 0.5 seconds before kicking the next member
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Announce completion
    await interaction.followUp({
      content: `Purged all non-organizers. Spared everyone with the following roles: ${do_not_purge_role_ids
        .map((id) => `<@&${id}>`)
        .join(", ")}`,
    });
  },
};
