
# Youtube Captions Search

A Chrome web extension for finding video times based on caption and subtitle text.

## Authors
- Felix Vaughan ([GitHub Profile](https://github.com/FelixVaughan/))

## Setup and Installation

### Clone the Project
```bash
git clone git@github.com:FelixVaughan/caption-search.git
```

### Prepare the Backend
1. Navigate to the lambda directory:
   ```bash
   cd youtube-captions-search/lambda
   ```
2. Install dependencies:
   ```bash
   npm i
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
   ![Select Folder](https://github.com/FelixVaughan/caption-search/assets/17572046/89c0910d-6699-405e-9d5b-b66641848d90)

## Demos
- ![Demo 1](https://github.com/FelixVaughan/caption-search/assets/17572046/d241afca-4eb9-4e80-b2af-2ed75a56c3c6)
- ![Demo 2](https://github.com/FelixVaughan/caption-search/assets/17572046/404e7070-ee48-458c-b7c4-b2868a60ffb0)

## Acknowledgements
- [Research icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/research)
