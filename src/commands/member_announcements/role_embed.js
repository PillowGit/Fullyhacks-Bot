const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const announcementRole = "1210858163801427999";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role_init")
    .setDescription("Sends an embed to the current channel allowing members to self role"),
  async execute(interaction, client, storage) {
    /*
     * Define the button that allows people to self role
     */
    const roleButton = new ButtonBuilder()
        .setLabel('Get Role')
        .setStyle(ButtonStyle.Primary)
        .setCustomId("self-role");
    /*
     * Build the interaction row to add to the message
     */
    const buttonRow = new ActionRowBuilder().addComponents(roleButton);
    /*
     * Send the message to the channel
     */
    await interaction.channel.send({
        content: `Want to be able to make announcements to your fellow hackers during the event? Want to let everyone know you're streaming a movie or making a boba run?\nGet the <@&${announcementRole}> role by pressing the button below!\n\nThis role causes you to be pinged whenever one of your fellow hackers wants to make an announcement during the hackathon!\nThis also allows you yourself to make announcements using the /request command associated with this bot in any channel\n\nNote that your announcement requests will be logged and reviewed by an organizer before they are sent to the associated channel. This will happen automatically once you run the /request command.`,
        components: [buttonRow],
    })
    /*
     * Let the user know their requst was sent with no problems
     */
    await interaction.reply({
        content: "Message initialized successfully",
        ephemeral: true,
    });
  },
};
