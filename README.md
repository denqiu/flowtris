# Game

### Objective

You must transport people through the city to the destination and fill in or avoid potholes along the way.

### How to Play

- Click a transportation vehicle to send people to the destination.
- [Optional] Select a pothole to fill it in.

---

# Development

### Dev Notes

- Node version: 22.19.0
- [PRD (Project Requirements Document)](PRD.md)
- Tasks: See [Issues](https://github.com/denqiu/flowtris/issues)
- [Devpost](https://devpost.com/software/hearing-mapped-to-infrastructure-analogy)

### FAQ

- How to Setup App for Multiple Developers:
    1. Create a copy of `devvit.json`, i.e., `devvit.local.json`.
    1. Modify `name` field, i.e., `<your-app-name>-<developer-initials>`. I just made it up. App name can be whatever you want but I find this is simple to work with.
    1. Add `devvit.local.json` to `.gitignore`.
    1. Inside `package.json`, add 2 commands, `dev:localdevvit` and `local`.
        - `dev:localdevvit`: `devvit playtest --config=devvit.local.json`
        - `local`: Copy `dev` and replace `npm run dev:devvit` with `npm run dev:localdevvit`.
    1. Go to https://developers.reddit.com/new to create app with modified name.
    1. If successful, you will see several commands. We do not need to run `npm create devvit@latest <token>`. Ignore it.
    1. Instead run `npm run local` to successfully generate playtest url. Navigate to url and find game in the top post. You should see `Launch App` button.
    1. If `Launch App` button doesn't appear, login to devvit, `devvit login`. Otherwise [503 error](https://www.reddit.com/r/lastfm/comments/fhlooe/anyone_getting_a_constant_error_503_first_byte/) appears in dev console.

### References

- [React.FC](https://dev.to/elhamnajeebullah/react-typescript-what-is-reactfc-and-why-should-i-use-it-4029)

---

# Starter Kit

### Devvit React Starter

A starter to build web applications on Reddit's developer platform

- [Devvit](https://developers.reddit.com/): A way to build and deploy immersive games on Reddit
- [Vite](https://vite.dev/): For compiling the webView
- [React](https://react.dev/): For UI
- [Express](https://expressjs.com/): For backend logic
- [Tailwind](https://tailwindcss.com/): For styles
- [Typescript](https://www.typescriptlang.org/): For type safety

### Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

### Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

### Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
