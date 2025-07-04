# Neon Tower Defense Shooter - Assets

This folder will contain the game's audio and visual assets.

## Audio Files Needed

For a complete game experience, you'll want to add the following audio files:

### Background Music
- `synthwave.mp3` - A looping synthwave/retrowave track for the main game

### Sound Effects
- `shoot.wav` - Projectile firing sound
- `explode.wav` - Enemy explosion sound  
- `hurt.wav` - Player damage sound
- `powerup.wav` - Power-up selection sound
- `click.wav` - UI button click sound

## Audio Sources

You can find royalty-free audio from:
- [Freesound.org](https://freesound.org) - CC0 and Creative Commons sounds
- [OpenGameArt.org](https://opengameart.org) - Game-specific audio assets
- [Zapsplat](https://zapsplat.com) - Professional sound effects (requires free account)

## File Size Guidelines

Keep total audio assets under 4MB to maintain fast loading:
- Background music: ~1-2MB (compressed MP3/OGG)
- Sound effects: 10-50KB each (short WAV/MP3)

## Implementation Note

The game will work without audio files - they're loaded with error handling that gracefully continues if files are missing.
