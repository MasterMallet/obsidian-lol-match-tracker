# LoL Match Tracker

An Obsidian plugin that automatically fetches your League of Legends match data from the Riot API and creates detailed match review notes.

## Features

- 🎮 **Automatic Match Data Fetching** - Retrieve your latest matches from Riot API
- 📝 **Detailed Match Notes** - Auto-generate markdown notes with comprehensive statistics
- 📊 **Performance Metrics** - Track KDA, CS, damage, gold, vision score, and builds
- 👥 **Friend Match Detection** - Automatically detect matches played with registered friends
- 💬 **Friend-Specific Notes** - Generate dedicated notes for each friend with feedback sections
- 🌐 **Multi-Language Support** - Available in English, Korean (한국어), and Japanese (日本語)
- 🏷️ **Smart Organization** - Tagged and categorized with frontmatter for easy searching
- ✍️ **Manual Notes** - Add your own reflections and observations

## Screenshots

### Match Note Example
Each match generates a comprehensive note with:
- Match overview (date, time, result, game mode)
- Performance statistics (KDA, CS, damage, gold, vision)
- Build details (items, runes, summoner spells)
- Team compositions
- Lane opponent information
- Reflection sections for personal notes

### Friend Note Example
When playing with registered friends, you also get:
- Friend's performance breakdown
- Feedback sections (strengths, improvements)
- Coordination notes
- Link to main match note

## Installation

### From Obsidian Community Plugins

1. Open **Settings** in Obsidian
2. Navigate to **Community Plugins** and disable **Restricted Mode**
3. Click **Browse** and search for "LoL Match Tracker"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/yourusername/lol-match-tracker/releases)
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/lol-match-tracker/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Setup

### 1. Get Your Riot API Key

1. Visit [Riot Developer Portal](https://developer.riotgames.com/)
2. Sign in with your Riot account
3. Click **"REGISTER PRODUCT"**
4. Copy your Development API key (valid for 24 hours)
	- For long-term use, apply for a Personal API Key

### 2. Configure the Plugin

1. Open **Settings** → **LoL Match Tracker**
2. Enter the following information:

#### API Settings
- **Riot API Key**: Your API key from the Developer Portal

#### Account Information
- **Summoner Name**: Your Riot ID (e.g., `HideOnBush`)
- **Tag Line**: Your tag (e.g., `NA1`, `KR1`, `JP1`)
- **Region**: Your server region

#### Language Settings
- **Language**: Choose your preferred language
	- English
	- 한국어 (Korean)
	- 日本語 (Japanese)

#### Note Settings
- **Notes Folder**: Folder path for match notes (default: `LoL Matches`)
- **Friends Folder**: Folder path for friend notes (default: `LoL Matches/Friends`)
- **Number of Matches**: How many recent matches to fetch (1-20)

### 3. Register Friends (Optional)

To track matches with specific friends:

1. Scroll to **Friend Management** section
2. Enter friend information:
	- **Display Name**: How they appear in notes (e.g., "John")
	- **Summoner Name**: Their Riot ID
	- **Tag Line**: Their tag
3. Click **Add**

Registered friends will have dedicated notes created automatically when you play together.

## Usage

### Fetching Matches

There are two ways to fetch your match data:

1. **Ribbon Icon**: Click the trophy 🏆 icon in the left sidebar
2. **Command Palette**: Press `Ctrl/Cmd + P` and search for "Fetch Latest Matches"

The plugin will:
- Fetch your recent matches
- Create a main match note for each game
- Create friend-specific notes if you played with registered friends
- Show a notification when complete

### Generated Notes Structure

#### Main Match Notes
**File Name**: `YYYY-MM-DD_ChampionName_Win/Loss.md`
**Location**: `LoL Matches/`

Contains:
- Match overview and result
- Your performance statistics
- Build information (items, runes, spells)
- Team compositions
- Lane opponent details
- Reflection sections for manual notes

#### Friend Notes
**File Name**: `YYYY-MM-DD_with_FriendName_Win/Loss.md`
**Location**: `LoL Matches/Friends/FriendName/`

Contains:
- Match overview (same team vs. versus)
- Your performance summary
- Friend's detailed performance
- Feedback sections:
	- Good points
	- Areas for improvement
	- Things to try next time
- Coordination notes
- Link to main match note

### Example Folder Structure

```
YourVault/
└── LoL Matches/
    ├── 2025-10-11_Ahri_Win.md
    ├── 2025-10-11_Zed_Loss.md
    └── Friends/
        ├── John/
        │   ├── 2025-10-11_with_John_Win.md
        │   └── 2025-10-12_with_John_Loss.md
        └── Sarah/
            └── 2025-10-11_with_Sarah_Win.md
```

## Advanced Features

### Dataview Integration

If you have the [Dataview plugin](https://github.com/blacksmithgu/obsidian-dataview) installed, you can create dynamic views of your match data:

**Recent matches:**
```dataview
TABLE 
  champion as "Champion",
  result as "Result",
  kda as "KDA",
  game_mode as "Mode"
FROM "LoL Matches"
WHERE date >= date(today) - dur(7 days)
SORT date DESC
```

**Win rate by champion:**
```dataview
TABLE 
  length(rows) as "Games",
  length(filter(rows, (r) => r.result = "Win")) as "Wins",
  round(length(filter(rows, (r) => r.result = "Win")) / length(rows) * 100, 1) + "%" as "Win Rate"
FROM "LoL Matches"
GROUP BY champion
SORT length(rows) DESC
```

**Matches with friends:**
```dataview
TABLE 
  friend as "Friend",
  result as "Result",
  same_team as "Same Team",
  my_champion as "My Champ",
  friend_champion as "Friend Champ"
FROM "LoL Matches/Friends"
SORT date DESC
LIMIT 10
```

**Win rate with specific friend:**
```dataview
TABLE 
  length(rows) as "Games",
  length(filter(rows, (r) => r.result = "Win")) as "Wins",
  round(length(filter(rows, (r) => r.result = "Win")) / length(rows) * 100, 1) + "%" as "Win Rate"
FROM "LoL Matches/Friends"
WHERE friend = "John" AND same_team = true
```

### Tags

Notes are automatically tagged for easy searching:

**Main Match Notes:**
- `#lol` - All LoL matches
- `#match` - Match notes
- `#win` / `#loss` - Match result
- `#championname` - Specific champion

**Friend Notes:**
- `#lol` - All LoL matches
- `#friend` - Friend matches
- `#friendname` - Specific friend
- `#win` / `#loss` - Match result

## Use Cases

### Solo Play
- Objectively analyze your performance
- Identify patterns by champion
- Track matchup win rates
- Review decision-making

### Duo/Flex with Friends
- Understand each other's playstyles
- Exchange constructive feedback
- Improve coordination
- Track growth together

### Team/Clan
- Unified format for all members
- Team-wide performance analysis
- Regular review meetings
- Member development tracking

## Troubleshooting

### Common Issues

**"Account retrieval failed: 403" error**
- Verify your API key is correct
- Check if your API key has expired (Development keys expire after 24 hours)
- Generate a new key from Riot Developer Portal

**"Account retrieval failed: 404" error**
- Verify your summoner name and tag line are correct
- Ensure region setting matches your actual server
- Format should be `SummonerName#TAG` (e.g., `HideOnBush#NA1`)

**Friends not detected**
- Verify friend's summoner name and tag are correct
- Try deleting and re-adding the friend in settings
- Ensure you were in the same match (spectating doesn't count)

**Friend notes not created**
- Friends must be registered before fetching matches
- Existing matches can be re-fetched to generate friend notes retroactively

**Matches not fetching**
- Ensure you've played recently
- Verify region matches your server
- Wait a moment if you hit rate limits (API restrictions)

**Plugin not appearing**
- Restart Obsidian
- Verify Community Plugins are enabled
- Check that files are in `.obsidian/plugins/lol-match-tracker/`

## API Rate Limits

### Development API Key
- **Rate Limits**: 20 requests/second, 100 requests/2 minutes
- **Duration**: 24 hours
- **Use**: Development and testing

### Personal API Key
- Higher rate limits
- Requires application
- Personal use only

The plugin automatically includes 100ms delays between requests to respect rate limits.

## Customization

### Note Templates

You can customize the generated note format by editing:
- `createMatchNote` method for main match notes
- `createFriendMatchNote` method for friend notes

### Adding Languages

To add a new language:
1. Create a translation object in `i18n.ts`
2. Add all required translation keys
3. Add language option to settings dropdown
4. Submit a pull request!

### Additional Data

The Riot API provides extensive data. You can extend the plugin to include:
- Timeline data (minute-by-minute details)
- Mastery points
- Rank information (LP, tier, division)
- Performance trends
- Champion-specific statistics

## Privacy & Data

- All data is stored locally in your Obsidian vault
- No data is sent to external servers (except Riot API)
- Your API key is stored in plugin settings
- Match data is fetched directly from Riot Games

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/MasterMallet/obsidian-lol-match-tracker/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/MasterMallet/obsidian-lol-match-tracker/issues)

## Contributing

Contributions are welcome! Please feel free to submit pull requests for:
- Bug fixes
- New features
- Additional language translations
- Documentation improvements

## License

MIT License - see LICENSE file for details

## Disclaimer

LoL Match Tracker isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

---

**Made with ❤️ for League of Legends players who love to improve**
