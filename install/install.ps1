#!/usr/bin/env pwsh
# TODO(everyone): Keep this script simple and easily auditable.
# Thanks deno.land for inspiration <3
#
#    Copyright (C) 2020 Flossbank, Inc.
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

$ErrorActionPreference = 'Stop'

$FlossbankInstall = $env:FLOSSBANK_INSTALL
if (!$FlossbankInstall) {
  $FlossbankInstall = Join-Path $Home ".flossbank"
}

if ($PSVersionTable.PSEdition -ne 'Core' -Or $IsWindows) {
  # if not using PowerShell Core, we must be on Windows PowerShell
  # if we are using PowerShell Core, $IsWindows should be exposed
  $Target = 'win-x86_64'
  $ExeName = 'flossbank.exe'
} else {
  $ExeName = 'flossbank'
  $Target = if ($IsMacOS) {
    'macos-x86_64'
  } else {
    'linux-x86_64'
  }
}

$BinDir = Join-Path $FlossbankInstall "bin"
$FlossbankZip = Join-Path $BinDir "flossbank.zip"
$FlossbankExe = Join-Path $BinDir $ExeName

$FlossbankInstallToken = $env:FLOSSBANK_INSTALL_TOKEN
if (!(Test-Path $FlossbankExe)) {
  $needInstallToken = $True
} else {
  $check = Start-Process $FlossbankExe -ArgumentList "check" -Wait -NoNewWindow -PassThru
  $needInstallToken = $check.ExitCode -ne 0
}
if ($needInstallToken -And !$FlossbankInstallToken) {
  $FlossbankInstallToken = Read-Host -Prompt 'Please enter install token to continue: '
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
Write-Output "You can uninstall at any time by executing 'flossbank uninstall'"
Write-Output "and these changes will be reverted."
Write-Output ""

# GitHub requires TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Response = Invoke-WebRequest 'https://github.com/flossbank/cli/releases/latest' -UseBasicParsing
$FlossbankUri = if ($PSVersionTable.PSEdition -eq 'Core') {
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

if (!$FlossbankUri) {
  Write-Output ""
  Write-Output "Error: unable to locate latest release on GitHub. Please try again or email support@flossbank.com for help!"
  return
}

$FlossbankVersion = $FlossbankUri.Split("/")[7]
$FlossbankFileName = $FlossbankUri.Split("/")[8]

Write-Output "Installing version: $FlossbankVersion"
Write-Output "  - Downloading $FlossbankFileName..."

Invoke-WebRequest $FlossbankUri -OutFile $FlossbankZip -UseBasicParsing
Expand-Archive $FlossbankZip -Destination $BinDir -Force
Remove-Item $FlossbankZip
if ($IsMacOS -Or $IsLinux) {
  chmod +x "$FlossbankExe"
}

Write-Output ""
$InstallArgs = "install", "$FlossbankInstall"
$WrapArgs = "wrap", "all"
$AuthArgs = "auth", "$FlossbankInstallToken"

$installCall = Start-Process $FlossbankExe -ArgumentList $InstallArgs -Wait -NoNewWindow -PassThru
$wrapCall = Start-Process $FlossbankExe -ArgumentList $WrapArgs -Wait -NoNewWindow -PassThru
if ($needInstallToken) {
  $authCall = Start-Process $FlossbankExe -ArgumentList $AuthArgs -Wait -NoNewWindow -PassThru
}
Write-Output ""

if ($installCall.ExitCode -ne 0 -Or $wrapCall.ExitCode -ne 0 -Or $authCall.ExitCode -ne 0) {
  Write-Output ""
  Write-Output "Oh no :( we had trouble setting up Flossbank. Please try again or email support@flossbank.com for help!"
  return
}

$envFile = Join-Path $FlossbankInstall "env.ps1"
. $envFile

Write-Output ""
Write-Output "Flossbank ($FlossbankVersion) is now installed and registered. Great!"
Write-Output ""
