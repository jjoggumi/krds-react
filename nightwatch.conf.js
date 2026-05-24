const { teacher, student, hitalk } = require('./test/nightwatch/config')

module.exports = {
  src_folders: ['test/nightwatch/main'],

  globals: {
    teacher, student, hitalk,
    host: 'http://localhost:8080'
  },

  plugins: [],
  globals_path: '',
  
  webdriver: {},

  test_workers: {
    enabled: true
  },

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: 'http://localhost:8080',

      screenshots: {
        enabled: false,
        path: 'screens',
        on_failure: true
      },

      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          prefs: {
            'profile.default_content_setting_values.notifications': 1
          },
          args: ['--window-size=1920,1080']
        }
      },
      
      webdriver: {
        start_process: true,
        server_path: ''
      },
      
    },
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          // More info on Chromedriver: https://sites.google.com/a/chromium.org/chromedriver/
          args: [
            //'--no-sandbox',
            //'--ignore-certificate-errors',
            //'--allow-insecure-localhost',
            //'--headless=new'
          ]
        }
      },

      webdriver: {
        start_process: true,
        server_path: '',
        cli_args: [
          // --verbose
        ]
      }
    },
    
    edge: {
      desiredCapabilities: {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          // More info on EdgeDriver: https://docs.microsoft.com/en-us/microsoft-edge/webdriver-chromium/capabilities-edge-options
          args: [
            //'--headless=new'
          ]
        }
      },

      webdriver: {
        start_process: true,
        server_path: '',
        cli_args: [
          // --verbose
        ]
      }
    },
    
    remote: {
      // Info on all the available options with "selenium":
      // https://nightwatchjs.org/guide/configuration/settings.html#selenium-server-settings
      selenium: {
        start_process: false,
        server_path: '',
        host: '<remote-hostname>',
        port: 4444
      },

      username: '${REMOTE_USERNAME}',
      access_key: '${REMOTE_ACCESS_KEY}',

      webdriver: {
        keep_alive: true,
        start_process: false
      }
    },
    
    'remote.chrome': {
      extends: 'remote',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true
        }
      }
    },
    
    'remote.edge': {
      extends: 'remote',
      desiredCapabilities: {
        browserName: 'MicrosoftEdge'
      }
    },
    
  },
  
  usage_analytics: {
    enabled: true,
    log_path: './logs/analytics',
    client_id: 'a6bd256a-ed55-4410-9a63-9c4b15a3b38b'
  }  
};
