# Soap Bandit Frontend

You shouldn't need to run npx create-react-app, the project is already initialized. Just switch to the frontend folder:

cd soap-bandits-frontend

and install all dependencies:

npm install

If you have trouble with the formatting and linting syncing correctly with React 19, run this instead:

npm install --legacy-peer-deps

If you are on Windows, there might be some line-endings and Tailwind classes that aren't formatting correctly, so you can standardize that so no errors from prettier or ESLint show up during compilation:

npm run format

I would run this before comitting code, it uses prettier to ensure the style guide is consistent across all environments.

If you haven't ran the app in development mode, here's the command:

npm start

The frontend is located on http://localhost:3000.

for production, run this:

npm run build

This will optimize the build for best performance.

Architexture and Organization:
Localization (i18n): All English text is managed in src/\_locales/en.json. This allows us to scale to other languages in the future without touching the UI code.

it is found here: src/\_locales/en.json

For building reusable UI elements, please put those here: src/\_components/

For styling, we are currently using the SoapStandle Brand Palette defined here: tailwind.config.js.
