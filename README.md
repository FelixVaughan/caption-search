
# Youtube Captions Search

A chrome web extension for finding video times based on caption and subtitle text  

## Authors

- [@FelixVaughan](https://github.com/FelixVaughan/)


## Run Locally

Clone the project

```bash
git clone git@github.com:FelixVaughan/caption-search.git
```

Go to the lambda directory

```bash
cd youtube-captions-search/lambda
```

Install dependencies

```bash
npm i
```

Build the project

```bash
sam build
```

Start the backend locally

```bash
sam local start-api -p 3333 --host 0.0.0.0
```

Go to the chrome extensions page

`chrome://extensions`


Turn on developer mode

![dev mode img](https://cdnblog.webkul.com/blog/wp-content/uploads/2019/07/15065714/3-2.png)

Load the unzipped extension

![unpack the extension](https://cdnblog.webkul.com/blog/wp-content/uploads/2019/07/15065849/4-3.png)


Select the extension folder from the cloned directory 

![extension local](https://github.com/FelixVaughan/caption-search/assets/17572046/89c0910d-6699-405e-9d5b-b66641848d90)


## Acknowledgements

 - [Research icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/research)

## Demo


https://github.com/FelixVaughan/caption-search/assets/17572046/d241afca-4eb9-4e80-b2af-2ed75a56c3c6


https://github.com/FelixVaughan/caption-search/assets/17572046/404e7070-ee48-458c-b7c4-b2868a60ffb0


