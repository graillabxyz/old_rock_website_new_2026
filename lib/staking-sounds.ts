// Staking sounds utility - migrated from amplify-client

const SOUND_PATHS = {
    changeGoliath: '/sounds/changeGoliath.mp3',
    changeRock: '/sounds/changeRock.mp3',
    claimDensity: '/sounds/claimDensity.mp3',
    claimDensitySuccess: '/sounds/claimDensitySuccess.mp3',
    connectGoliath: '/sounds/connectGoliath.mp3',
    connectGoliathSuccess: '/sounds/connectGoliathSuccess.mp3',
    connectWallet: '/sounds/connectWallet.mp3',
    disconnectGoliath: '/sounds/disconnectGoliath.mp3',
    showConnectedGoliaths: '/sounds/showConnectedGoliaths.mp3',
};

export type SoundName = keyof typeof SOUND_PATHS;

export function playSound(soundName: SoundName): void {
    if (typeof window === 'undefined') return;

    try {
        const audio = new Audio(SOUND_PATHS[soundName]);
        audio.volume = 0.5;
        audio.play().catch((err) => {
            // Silently fail if autoplay is blocked
            console.debug('Sound play failed:', err);
        });
    } catch (err) {
        console.debug('Sound error:', err);
    }
}

export default SOUND_PATHS;
