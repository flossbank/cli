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

flossbank_asset_path=$(
  command curl -sSf https://github.com/flossbank/cli/releases |
    command grep -o "/flossbank/cli/releases/download/.*/flossbank-${target}\\.zip" |
    command head -n 1
)
if [ ! "$flossbank_asset_path" ]; then exit 1; fi
flossbank_uri="https://github.com${flossbank_asset_path}"

flossbank_install="${FLOSSBANK_INSTALL:-$HOME/.flossbank}"
bin_dir="$flossbank_install/bin"
exe="$bin_dir/flossbank"

if [ ! -d "$bin_dir" ]; then
	mkdir -p "$bin_dir"
fi

curl --fail --location --progress-bar --output "$exe.zip" "$flossbank_uri"
cd "$bin_dir"
unzip -o "$exe.zip"
chmod +x "$exe"
rm "$exe.zip"

echo "flossbank was installed successfully to $exe"

$exe install
$exe wrap all
$exe auth
