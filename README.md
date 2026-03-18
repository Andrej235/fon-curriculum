# FON Curriculum

FON Curriculum is a web app for building and viewing a personalized class schedule for the Faculty of Organizational Sciences (FON), University of Belgrade. It includes a predefined global timetable and lets users create their own weekly view by selecting classes, then adjusting it directly in the table UI.

This repository contains two parts:

- `website/` - Next.js web application (the main app users interact with)
- `get-curriculum/` - utility script used to extract timetable data from the official PDF source

## Run Locally

### 1) Start the web app

```bash
cd website
npm install
npm run dev
```

Then open http://localhost:3000.

### 2) (Optional) Regenerate curriculum data

Use this only if you want to re-parse the source PDF and generate new timetable output.

```bash
cd get-curriculum
npm install
npm run dev
```

The script writes parsed data to `get-curriculum/output.json`.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI + shadcn/ui components

## License

This project is licensed under the MIT License. See the `LICENSE` file for full text.
