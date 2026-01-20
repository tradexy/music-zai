## Instructions
How to Test and Play:
Browser Sound: The app has a built-in "Acid" synthesizer (using Tone.js). Simply click the Play button (or toggle notes on the grid) to hear sounds directly from your computer speakers.
MIDI Hardware: Connect your hardware synthesizer (like a TB-303 clone or any MIDI synth) to your computer via USB-MIDI.
In the app's right-hand panel ("Hardware I/O"), select your device from the "MIDI Output Device" dropdown.
Set the channel to match your hardware (usually Channel 1).
When you press Play, the app will send note data to your hardware.
Deployment (GitHub Pages, Netlify, Cloudflare):
The code provided here is written in React with TypeScript (.tsx). Browsers cannot understand .tsx files directly; they must be "compiled" or "built" into standard JavaScript.
To put this on the internet:
Set up a Build Tool: You should use a tool like Vite (recommended for speed and ease).
Run npm create vite@latest music-zai -- --template react-ts in your terminal.
Install the dependencies: npm install tone lucide-react.
Move Code: Copy the files I've generated (App.tsx, components, services) into the src folder of that Vite project.
Build: Run npm run build. This creates a dist folder with standard HTML/JS.
Deploy:
GitHub Pages: You can use a GitHub Action to deploy the dist folder, or use the gh-pages package.
Netlify / Cloudflare Pages: These are often easier. You simply link your GitHub repository to Netlify/Cloudflare, and set the build command to npm run build and publish directory to dist. They handle the rest automatically.



<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Z6cKgIinPXL4p-H4CjVsThdyA9Nd4okm

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
