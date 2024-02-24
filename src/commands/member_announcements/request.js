const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const reqchannelid = "1210860545515847731";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("request")
    .setDescription("Request to make an announcement")
    .addStringOption( option => 
        option.setName("announcement")
        .setRequired(true)
        .setDescription("Announcement message to be sent")
    ),
  async execute(interaction, client, storage) {
    /*
     * Generate button objects to be added to the message response
     */
    const approveButton = new ButtonBuilder()
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setCustomId(`${interaction.id}1`);
    const denyButton = new ButtonBuilder()
        .setLabel('Deny')
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`${interaction.id}0`);
    /*
     * Build the interaction row & grab the channel the button and request embed will be sent to
     */
    const buttonRow = new ActionRowBuilder().addComponents(approveButton, denyButton);
    const channel = await client.channels.cache.get(reqchannelid);
    /*
     * Build the actual embed representin a request to make an announcement
     */
    const announcementOption = interaction.options.getString("announcement");
    const requestEmbed = new EmbedBuilder()
        .setColor("#328bc7")
        .setTitle(`Announcement request from ${interaction.user.displayName} (${interaction.user.tag})`)
        .setDescription(announcementOption);
    /*
     * Send the users request to the dedicated channel and store it in our storage
     */
    const requestMessage = await channel.send({
        embeds: [requestEmbed],
        components: [buttonRow],
    });
    await storage.setItem(`${interaction.id}`, [requestMessage.id, announcementOption, interaction.user.id ]);
    /*
     * Let the user know their requst was sent with no problems
     */
    await interaction.reply({
        content: "Your request was successfully sent!",
        ephemeral: true
    });
  },
};