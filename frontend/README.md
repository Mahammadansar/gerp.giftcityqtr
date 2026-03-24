# Gift & Advertisement ERP

Complete ERP for a gift and advertisement company (Standard + and Professional + feature set).  
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deploying to Vercel

Yes, this app works on Vercel. The repo includes a `vercel.json` that sets the build output and SPA routing.

**Option A – Deploy from Git (recommended)**  
1. Push the project to GitHub/GitLab/Bitbucket.  
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** and import the repo.  
3. Vercel will detect the config; keep **Build Command**: `npm run build`, **Output Directory**: `dist/broker-portal`.  
4. Click **Deploy**. Later pushes to the main branch will trigger new deployments.

**Option B – Deploy from your machine**  
1. Install the Vercel CLI: `npm i -g vercel`  
2. In the project folder run: `vercel`  
3. Follow the prompts and deploy.

After deploy, routes like `/dashboard`, `/sales`, `/invoices` will work because `vercel.json` rewrites them to `index.html` for Angular’s client-side routing.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
