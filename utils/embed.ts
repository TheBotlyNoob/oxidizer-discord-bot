import {
  MessageEmbed,
  CommandInteraction,
  EmbedFieldData,
  ColorResolvable
} from 'discord.js';

export default ({
  title,
  description,
  interaction,
  fields,
  color,
  url,
  footer
}: options) =>
  new MessageEmbed()
    .setAuthor(
      interaction.user.tag,
      interaction.user.displayAvatarURL({ dynamic: true })
    )
    .setTitle(title)
    .setDescription(description)
    .addFields(fields || [])
    .setColor(color || 0x50c878)
    .setURL(url || '')
    .setFooter(footer?.text, footer?.iconURL)
    .setTimestamp();

interface options {
  title: string;
  description: string;
  interaction: CommandInteraction;
  footer?: { iconURL?: string; text: string };
  fields?: EmbedFieldData[];
  color?: ColorResolvable;
  url?: string;
}
