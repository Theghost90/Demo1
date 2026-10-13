# Publishing the site (no coding needed)

The website is the `dist` folder. Publishing means putting that folder on a web host. These steps use Netlify's
drag-and-drop upload, which is free for a site like this.

## A. Build the folder

In PowerShell:

```powershell
cd $HOME\Desktop\Demo1
git pull
npm run build
explorer dist
```

The last line opens the `dist` folder. It must contain `index.html`, a `fr` folder, an `assets` folder and a `fonts`
folder. This is the only folder you upload.

## B. Put it online (about 10 minutes)

1. Create a free account at https://app.netlify.com/signup. Do this first, so the site is saved to your account.
2. Open https://app.netlify.com/drop.
3. Drag the `dist` folder (the folder itself, not a zip) onto the page. Wait until it finishes.
4. Netlify shows an address like `something-random.netlify.app`. Open it and check the English page, then add `/fr/`
   to the address to check the French page.
5. Give it a better name: open the site in Netlify, go to the project or site settings, find "Project name" or
   "Site name", choose Change, and enter something like `josephfranck`. The address becomes `josephfranck.netlify.app`.

## C. Tell the site its final address (so WhatsApp and LinkedIn previews work)

```powershell
cd $HOME\Desktop\Demo1
$env:SITE_URL = "https://josephfranck.netlify.app"
npm run build
```

Then, in Netlify, open the site, go to **Deploys**, and drag the new `dist` folder onto the box that says to drag
and drop a folder to deploy a new version. The old version is replaced within seconds.

## D. Your own domain (optional, about 10 to 15 USD a year)

1. Buy a domain (for example a `.com`) from a registrar such as Namecheap, Porkbun, Cloudflare or GoDaddy.
2. In Netlify, open the site, go to **Domain management**, choose **Add a domain**, type your domain, and confirm.
3. Netlify then shows exactly what to change at your registrar. Follow the values on the screen. Usually this is one of:
   - **Easiest:** use Netlify DNS. Netlify gives you nameservers. At your registrar, find "Nameservers" and choose
     "Custom", then paste Netlify's nameservers.
   - **Or** add records at your registrar: a `CNAME` record for `www` pointing to your `.netlify.app` address, and the
     root-domain record Netlify shows you.
4. Wait. It usually takes minutes, and can take up to 48 hours.
5. In Domain management, under **HTTPS**, make sure the certificate is active (use the verify or provision button if
   it is not). The address must start with `https://` and show a padlock.
6. Rebuild with the final address and upload again (step C), using `https://yourdomain.com` as `SITE_URL`.

## E. Every later change

Edit the text in `content\en.json` and `content\fr.json`, then run `npm run build` and drag `dist` onto Netlify's
Deploys page again.

## Final check on your phone

Open the live address on a phone. Check both languages, tap "Send an email", and send the link to yourself on
WhatsApp to confirm the preview shows your name.
