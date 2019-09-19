# StudUCLouvain : Migration to ionic-v4
## README :  https://github.com/UCL-INGI/StudUCLouvain
## WIP - Work In Progress
## Feel free to collaborate.
### Anyone wishing to participate and/or propose new fixtures/ideas to improve the app should not hesitate to contact StudUCLouvain@uclouvain.be or directly make a pull-request on the repo concerned.

### TO FIX
#### ERROR Error: "Uncaught (in promise): overlay does not exist" : FIXED ?
       1. https://github.com/ionic-team/v4-migration-tslint
       2. npx tslint -c ionic-migration.json -p tsconfig.json --fix
       3. Add .then(...) to modal etc.

#### TEST FAIL RANDOM : MobilityComponent should be created


### TO DO :

- Write unit tests (WIP)

  1. Create \*.spec.ts for all pages
     - subpages
  2. Cover important parts with tests
     - subpages
     - services

- Functional tests ? (WIP)

  * Make user stories (1/?)

### TIPS
#### - To launch only one test page : replace the 'describe' with the wanted scope by fdescribe in <page_name>.spec.ts

## Prerequisites
- Download nodejs from https://nodejs.org/en/download/current/ It will install `node` and `npm`
```bash
node -v
 - should be >= 10.0.0
npm -v
 - should be >= 6.0.0
```
