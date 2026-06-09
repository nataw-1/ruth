# FormSubmit.co Setup Guide for Axum Scholars Contact Form

This is a **simple, no-code setup** that requires no API keys or complex configuration.

## How It Works

The contact form sends messages directly to `axum.scholars12@gmail.com` using **FormSubmit.co**, a free service that requires zero setup.

## First Time Setup (One-Time Only)

When someone submits the form for the **first time**, FormSubmit.co will send an **activation email** to `axum.scholars12@gmail.com`.

### Steps:

1. **Someone fills out and submits the contact form** on your website.
2. **Check the email inbox** at `axum.scholars12@gmail.com` for an email from FormSubmit.co.
3. **Click the activation link** in that email.
4. **Done!** After activation, all future form submissions will be sent to your email automatically.

## That's It!

- **No API keys needed**
- **No configuration required**
- **Completely free**
- **Works with internet connection**
- **Messages go directly to your email**

## Features Included

✅ Form validation (required fields)  
✅ Success/error messages on the page  
✅ Spam protection (honeypot field)  
✅ Automatic email subject line  
✅ Reply-to field with sender's email  

## Troubleshooting

**"Error sending message" appears:**
- Make sure you have an internet connection
- Check that you've activated the form (see "First Time Setup" above)
- Try submitting again after a few seconds

**Not receiving emails:**
- Check your spam/junk folder
- Make sure you clicked the activation link in the first email from FormSubmit.co
- Verify the email address is correct in the form's action attribute

**Want to change the email address?**
- Edit `contact.html` and change `axum.scholars12@gmail.com` in the form's `action` attribute
- You'll need to activate the new email address by submitting the form once

## Security

- FormSubmit.co is a trusted service used by thousands of websites
- Your email address is protected and not shared
- No sensitive data is stored on FormSubmit servers
- All submissions are processed securely

For more information, visit [FormSubmit.co](https://formsubmit.co/)
