#!/bin/sh
# Copyright 2020 Flossbank. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.
set -e

case $(uname -s) in
Darwin) target="macos-x86_64" ;;
*) target="linux-x86_64" ;;
esac

if [ $(uname -m) != "x86_64" ]; then
	echo "Unsupported architecture $(uname -m). Only x64 binaries are available."
	exit
fi

flossbank_install="${FLOSSBANK_INSTALL:-$HOME/.flossbank}"
bin_dir="$flossbank_install/bin"
exe="$bin_dir/flossbank"

if [ ! -d "$bin_dir" ]; then
	mkdir -p "$bin_dir"
fi

echo
echo "Welcome to Flossbank!"
echo
echo "This script will download and install the latest version of Flossbank,"
echo "a package manager wrapper that helps compensate open source maintainers."
echo
echo "It will add the 'flossbank' command to Flossbank's bin directory, located at:"
echo
echo "${bin_dir}"
echo
echo "This path will then be added to your PATH environment variable by"
echo "modifying your shell profile/s."
echo
echo "You can uninstall at any time by executing 'flossbank --uninstall'"
echo "and these changes will be reverted."
echo

flossbank_asset_path=$(
  command curl -sSLf https://github.com/flossbank/cli/releases/latest |
    command grep -o "/flossbank/cli/releases/download/.*/flossbank-${target}\\.zip" |
    command head -n 1
)
if [ ! "$flossbank_asset_path" ]; then
  echo
  echo "Error: unable to locate latest release on GitHub. Please try again or email support@flossbank.com for help!"
  exit 1
fi

flossbank_version=$(echo "$flossbank_asset_path" | cut -d'/' -f 6)
flossbank_file_name=$(echo "$flossbank_asset_path" | cut -d'/' -f 7)

flossbank_uri="https://github.com${flossbank_asset_path}"

echo "Installing version: ${flossbank_version}"
echo "  - Downloading ${flossbank_file_name}..."

curl -sS --fail --location --output "$exe.zip" "$flossbank_uri"
cd "$bin_dir"
unzip -qq -o "$exe.zip"
chmod +x "$exe"
rm "$exe.zip"

echo
$exe install "$flossbank_install"
$exe wrap all
echo

if ! $exe check; then
  echo "The next step is to verify your email address."
  echo
  $exe auth
fi

echo
echo "Flossbank (${flossbank_version}) is now installed and registered. Great!"
echo
echo "To get started, you need Flossbank's bin directory (${bin_dir}) in your 'PATH'"
echo "environment variable. Next time you log in this will be done"
echo "automatically."
echo
echo "To configure your current shell run 'source ${flossbank_install}/env'"
echo
