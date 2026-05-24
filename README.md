# hi-class-ui-node

## Project setup
```
npm install     # normal install 
npm ci          # module clean and install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build[-${env mode}]
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Vue CLI - [Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables)
```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

### Vue CLI - [Local Only Variables](https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code)
Sometimes you might have env variables that should not be committed into the codebase, especially if your project is hosted in a public repository. In that case you should use an `.env.local` file instead. Local env files are ignored in `.gitignore` by default.

`.local` can also be appended to mode-specific env files, for example `.env.development.local` will be loaded during development, and is ignored by git.
