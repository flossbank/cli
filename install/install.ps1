#!/usr/bin/env pwsh
# Copyright 2020 the Flossbank authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.
# Thanks deno.land for inspiration <3
$ErrorActionPreference = 'Stop'

$Target = 'win-x86_64'

$FlossbankInstall = $env:FLOSSBANK_INSTALL
$BinDir = if ($FlossbankInstall) {
  "$FlossbankInstall\bin"
} else {
  "$Home\.flossbank\bin"
}

if (!(Test-Path $BinDir)) {
  New-Item $BinDir -ItemType Directory | Out-Null
}

Write-Output ""
Write-Output "Welcome to Flossbank!"
Write-Output ""
Write-Output "This script will download and install the latest version of Flossbank,"
Write-Output "a package manager wrapper that helps compensate open source maintainers."
Write-Output ""
Write-Output "It will add the 'flossbank' command to Flossbank's bin directory, located at:"
Write-Output ""
Write-Output "$BinDir"
Write-Output ""
Write-Output "This path will then be added to your PATH environment variable by"
Write-Output "modifying your shell profile/s."
Write-Output ""
Write-Output "You can uninstall at any time by executing 'flossbank --uninstall'"
Write-Output "and these changes will be reverted."
Write-Output ""

# GitHub requires TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Response = Invoke-WebRequest 'https://github.com/flossbank/cli/releases/latest' -UseBasicParsing
$FlossbankUri = {
  $Response = Invoke-WebRequest 'https://github.com/flossbank/cli/releases/latest' -UseBasicParsing
  if ($PSVersionTable.PSEdition -eq 'Core') {
    $Response.Links |
      Where-Object { $_.href -like "/flossbank/cli/releases/download/*/flossbank-${Target}.zip" } |
      ForEach-Object { 'https://github.com' + $_.href } |
      Select-Object -First 1
  } else {
    $HTMLFile = New-Object -Com HTMLFile
    if ($HTMLFile.IHTMLDocument2_write) {
      $HTMLFile.IHTMLDocument2_write($Response.Content)
    } else {
      $ResponseBytes = [Text.Encoding]::Unicode.GetBytes($Response.Content)
      $HTMLFile.write($ResponseBytes)
    }
    $HTMLFile.getElementsByTagName('a') |
      Where-Object { $_.href -like "about:/flossbank/cli/releases/download/*/flossbank-${Target}.zip" } |
      ForEach-Object { $_.href -replace 'about:', 'https://github.com' } |
      Select-Object -First 1
  }
}

if (!$FlossbankUri) {
  Write-Output ""
  Write-Output "Error: unable to locate latest release on GitHub. Please try again or email support@flossbank.com for help!"
  exit 1
}
$FlossbankVersion = $FlossbankUri.Split("/")[7]
$FlossbankFileName = $FlossbankUri.Split("/")[8]

$FlossbankZip = "$BinDir\flossbank.zip"
$FlossbankExe = "$BinDir\flossbank.exe"

Write-Output "Installing version: $FlossbankVersion"
Write-Output "  - Downloading $FlossbankFileName..."

Invoke-WebRequest $FlossbankUri -OutFile $FlossbankZip -UseBasicParsing
Expand-Archive $FlossbankZip -Destination $BinDir -Force
Remove-Item $FlossbankZip

Write-Output ""
$InstallArgs = "install", "$FlossbankInstall"
$WrapArgs = "wrap", "all"

& $FlossbankExe $InstallArgs
& $FlossbankExe $WrapArgs
Write-Output ""

& $FlossbankExe 'check'
if ($LASTEXITCODE -ne 0) {
  Write-Output "The next step is to verify your email address."
  Write-Output ""
  & $FlossbankExe 'auth'
}

. "$FlossbankInstall\env.ps1"

Write-Output ""
Write-Output "Flossbank ($FlossbankVersion) is now installed and registered. Great!"
Write-Output ""
