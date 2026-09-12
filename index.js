const {
    Client,
    GatewayIntentBits,
    ChannelType
} = require('discord.js');

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType
} = require('@discordjs/voice');

const path = require('path');

// Configuration
const TOKEN = process.env.DISCORD_TOKEN;

const ATTENTE_STAFF_ID = '1122562357164519432';

const AUDIO_FILE = path.join(__dirname, 'icesunny.mp3');

// Création du bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Quand le bot est connecté
client.once('ready', () => {
    console.log(`🎙️ ${client.user.tag} est connecté !`);
    console.log('Réceptionniste IceSunny prête.');
});

// Détection des arrivées dans Attente Staff
client.on('voiceStateUpdate', async (oldState, newState) => {

    // Ignorer les bots
    if (newState.member?.user.bot) return;

    // Vérifier qu'une personne vient d'entrer dans le salon
    if (
        newState.channelId === ATTENTE_STAFF_ID &&
        oldState.channelId !== ATTENTE_STAFF_ID
    ) {

        console.log(
            `🎧 ${newState.member.user.tag} est arrivé dans Attente Staff.`
        );

        try {

            // Rejoindre le salon vocal
            const connection = joinVoiceChannel({
                channelId: ATTENTE_STAFF_ID,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator,
                selfDeaf: false
            });

            // Attendre la connexion
            await entersState(
                connection,
                VoiceConnectionStatus.Ready,
                30_000
            );

            // Créer le lecteur audio
            const player = createAudioPlayer();

            // Charger le fichier MP3
            const resource = createAudioResource(AUDIO_FILE, {
                inputType: StreamType.Arbitrary
            });

            // Lire le message de bienvenue
            player.play(resource);
            connection.subscribe(player);

            console.log('🔊 Message de bienvenue lancé !');

            // Une fois le message terminé
            player.once(AudioPlayerStatus.Idle, () => {
                console.log('✅ Message terminé.');
            });

        } catch (error) {

            console.error(
                '❌ Erreur lors de la lecture audio :',
                error
            );

        }
    }
});

// Connexion à Discord
client.login(TOKEN);
