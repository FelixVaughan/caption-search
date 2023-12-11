
# Youtube Captions Search

A Chrome web extension for finding video times based on caption and subtitle text.

## Authors
- Felix Vaughan ([GitHub Profile](https://github.com/FelixVaughan/))

## Requirements

Before setting up the project, ensure you have the following tools installed:

- **AWS SAM**: AWS Serverless Application Model (SAM) is required for building and testing Lambda functions. Install it from the [AWS SAM website](https://aws.amazon.com/serverless/sam/).
- **Node.js**: Node.js is necessary for running the backend services. Download and install it from [Node.js website](https://nodejs.org/).
- **Docker**: Docker is used for creating a local environment that mimics the Lambda environment for testing purposes. Install Docker from the [Docker website](https://www.docker.com/get-started).

## Setup and Installation

### Clone the Project
```bash
git clone git@github.com:FelixVaughan/youtube-captions-search.git
```

### Prepare the Backend
1. Navigate to the lambda directory:
   ```bash
   cd youtube-captions-search/lambda/captions-lambda
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Go to directory containing template.yaml:
   ```bash
   cd ..
   ```
3. Build the project:
   ```bash
   sam build
   ```
4. Start the backend locally:
   ```bash
   sam local start-api -p 3333 --host 0.0.0.0
   ```

### Install the Extension in Chrome
1. Go to `chrome://extensions`.
2. Enable Developer Mode. 
   ![Developer Mode](https://cdnblog.webkul.com/blog/wp-content/uploads/2019/07/15065714/3-2.png)
3. Load the unzipped extension.
   ![Load Extension](https://cdnblog.webkul.com/blog/wp-content/uploads/2019/07/15065849/4-3.png)
4. Select the extension folder from the cloned directory.
   ![Select Folder](https://github.com/FelixVaughan/caption-search/assets/17572046/5e3f34c7-79af-4f9f-8720-0673f28dcc01)

## Demos
- ![Demo 1](https://github.com/FelixVaughan/caption-search/assets/17572046/d241afca-4eb9-4e80-b2af-2ed75a56c3c6)
- ![Demo 2](https://github.com/FelixVaughan/caption-search/assets/17572046/404e7070-ee48-458c-b7c4-b2868a60ffb0)

## Acknowledgements
- [Research icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/research)
