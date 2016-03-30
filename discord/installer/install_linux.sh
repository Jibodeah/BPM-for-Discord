#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_OPTIONS=("Download correct node and install" "Install using local version" "Exit")

runInstaller() {
    echo "Please enter the install directory";
    read INSTALL_DIR;
    echo "Installing to $INSTALL_DIR";

    $DIR/node $DIR/index.js $DIR -p $INSTALL_DIR;
}

#TODO:  Confirm this is cool with the user
downloadNodeAndInstall() {
    echo "Downloading standalone tarball..." 
    if [ `getconf LONG_BIT` = "64" ]; then
        curl -o $DIR/node.tar.gz https://nodejs.org/dist/v4.2.4/node-v4.2.4-linux-x64.tar.gz
        echo "Unpacking node..."
        tar --strip-components=2 -xvf $DIR/node.tar.gz -C $DIR node-v4.2.4-linux-x64/bin/node
    else
        #32-bit stuff goes here
        curl -o $DIR/node.tar.gz https://nodejs.org/dist/v4.2.4/node-v4.2.4-linux-x32.tar.gz
        echo "Unpacking node..."
        tar --strip-components=2 -xvf $DIR/node.tar.gz -C $DIR node-v4.2.4-linux-x32/bin/node
    fi
    runInstaller;
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
        runInstaller;
    else    
        echo "Could not find node of version v4.2.x, found node version $NODE_VERSION. What would you like to do?";
        select yn in "${INSTALL_OPTIONS[@]}"; do
            case $yn in
                "${INSTALL_OPTIONS[0]}") 
                    downloadNodeAndInstall
                    exit
                    ;;
                "${INSTALL_OPTIONS[1]}")
                    runInstaller
                    exit
                    ;;
                "${INSTALL_OPTIONS[2]}")
                    exit
                    ;;
                *)
                    echo "Invalid option, try another one.";
                    continue
                    ;;
            esac
        done
    fi
fi

echo "Press enter to continue..."
read BLANK

