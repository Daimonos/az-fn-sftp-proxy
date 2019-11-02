# Setup

## Config

### Local

For local development, add a file called `local.settings.json` with the following variables set up:

```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS-WORKER-RUNTIME": "node",
    "APP-SFTP-SERVER-URL": "some-linux-box.com",
    "APP-SFTP-SERVER-PORT": "22",
    "APP-SFTP-SERVER-USERNAME": "some-username",
    "APP-SFTP-SERVER-PASSWORD": "some-password",
    "APP-SFTP-SERVER-FOLDER": "/some/path"
  }
}
```

Where those things matter. This is a function to proxy a web request to write a file to a server via SFTP

### Cloud

I'm not really here to tell you best practices - you could arguably configure the app's environment variables in the Function service on azure portal OR you could use a keyvault and add follow the process there.
I learned how to do it from: https://practical365.com/azure-ad/securing-sensitive-information-in-azure-functions-with-the-azure-key-vault/

## Local Development

There's loads of resources available. I like to use VS Code. See: https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-vs-code for some details on setting up a local development environent for azure functions
