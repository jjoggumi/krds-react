FROM node:16

RUN apt-get update && apt-get install -y jq wget unzip --no-install-recommends \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y google-chrome-stable --no-install-recommends \
  && apt-get clean && rm -rf /var/lib/apt/lists/* \
  && CHROME_VERSION=$(google-chrome --version | awk '{print $3}') \
  && LATEST_DRIVER_URL=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" | \
     jq -r --arg CHROME_VERSION "$CHROME_VERSION" '.channels | to_entries[] | select(.value.version | startswith($CHROME_VERSION[:3])) | .value.downloads.chromedriver[] | select(.platform == "linux64") | .url' | head -n 1) \
  && wget -q "$LATEST_DRIVER_URL" -O chromedriver-linux64.zip \
  && unzip -q chromedriver-linux64.zip && mv chromedriver-linux64/chromedriver /usr/local/bin/ \
  && chmod +x /usr/local/bin/chromedriver && rm -rf chromedriver-linux64.zip chromedriver-linux64
