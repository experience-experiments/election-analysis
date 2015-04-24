# UK General Election Vote Analyser

This site aims to provide a map based tool to analyse the parlementary seat changes according to projected national voting percentages compared with the 2010 election results.

You can adjust the national percantages to see how it projects onto the constituencies.

## Developers

### Running locally

To run/test the project locally, you need to have `NPM` and `Grunt-CLI` and `bower` installed on your dev environment.

Run the following commands when you pull the repository for initial setup. Generation of optimized result data from 2010 with.

```
npm install
bower install
cd app/data
node optimiseResults.js > 2010.json
cd ../..

```

You complete the initial setup you can run the following commands from the project root to debug the project locally.

`grunt serve`

For more information check the `Gruntfile`


### Releasing to public

To build and upload to S3 bucket, create a aws-s3-credentials.json file as following:

```
{
  "accessKeyId": "...",
  "secretAccessKey": "..."
}
```

Note that this file should not be committed to the git repository. Then run the following command to release the app.

`grunt release`


# LICENCE

The MIT License (MIT)