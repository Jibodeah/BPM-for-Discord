#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#TODO:  Confirm this is cool with the user
downloadNodeAndInstall() {
    echo "Downloading standalone tarball..." 
    curl -o $DIR/node.tar.gz https://nodejs.org/dist/v4.2.4/node-v4.2.4-darwin-x64.tar.gz
    echo "Unpacking node..."
    tar --strip-components=2 -xvf $DIR/node.tar.gz -C $DIR node-v4.2.4-darwin-x64/bin/node
    $DIR/node $DIR/index.js $DIR
    echo "Removing node tarball and extract..."
    rm -rf $DIR/node
    rm -f $DIR/node.tar.gz
}

if [ -z $(which node) ]; then
    echo "Cannot find node"
    downloadNodeAndInstall
else
    NODE_VERSION=$(node --version)
    if [[ $NODE_VERSION == *"v4.2"* ]]; then
        echo "Found node, running with local version...";
        node $DIR/index.js $DIR
    else    
        echo "Could not find node of version v4.2.x, found node version $NODE_VERSION"
        downloadNodeAndInstall
    fi
fi

echo "Press enter to continue..."
read BLANK

