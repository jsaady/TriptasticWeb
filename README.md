# Node/React Starter



## Getting started

Make sure to update the variables under ci/cd to ensure auto-devops works correctly
```bash
KUBE_CONTEXT=jteq/cluster:node-2
KUBE_INGRESS_BASE_DOMAIN=auto.holyham.cloud
KUBE_NAMESPACE=<group>-<repo_name>
POSTGRES_ENABLED=true
```

## Commands

`npm run serve` - serves the API and UI. Access the site through localhost:1234
`npm run serve:ui` - serves the UI only on port 1234. Proxies `/api` requests to localhost:5000
`npm run serve:api` - serves the API only on port 5000. Serves static content from `dist/ui`
`npm run build` - builds the UI and the API
`npm run build:ui` - builds the UI and outputs to `dist/ui`
`npm run build:api` - builds the API and outputs to `dist/api`. This is required to run `npm start`
`npm test` - runs `jest` in ci mode with coverage
`npm start` - runs `node dist/api/main`

